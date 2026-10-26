/* AI Assistant widget - front-end for the visitor-facing features.
 *
 * Talks to the API under /api (see server/functions). Plain
 * browser JS, no build step: fetch + ReadableStream for the chat's SSE
 * stream, and small renderers for the "project fit" and "draft a message"
 * results.
 */
(function () {
  "use strict";

  // Where the API lives. Empty means same origin (`npm run dev`).
  // On a static host such as GitHub Pages, set window.ASSISTANT_API_BASE in
  // index.html to the deployed API URL (for example the Cloudflare Worker).
  var BASE = String(window.ASSISTANT_API_BASE || "").replace(/\/+$/, "");
  var API = { health: BASE + "/api/health", chat: BASE + "/api/chat", fit: BASE + "/api/fit", draft: BASE + "/api/draft" };
  var CONTACT_EMAIL = "danielchoi@engineer.com";

  var SAMPLE_FIT =
    "We're a small healthcare startup building an internal tool for care coordinators. " +
    "It needs a React dashboard, a Python API over PostgreSQL, integrations with HL7/FHIR data from hospitals, " +
    "and an AI assistant that summarizes patient notes and answers questions about them with citations. " +
    "We'd like to ship a first version in about three months and need someone who can lead the technical side.";

  var SAMPLE_DRAFT =
    "I'm the founder of a fintech startup. We need a React + Node dashboard with an AI assistant for our support team. " +
    "Timeline is roughly three months, budget is flexible for the right person. Would love a quick intro call.";

  var state = { configured: null, mock: false, chatHistory: [], busy: {}, open: false, healthChecked: false };

  // ---- helpers -------------------------------------------------------------
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmtMs(ms) {
    return ms >= 1000 ? (ms / 1000).toFixed(1) + "s" : Math.round(ms) + "ms";
  }
  function scrollToEnd(node) {
    node.scrollTop = node.scrollHeight;
  }
  function loadingDots() {
    return el("div", "asst-loading", "<i></i><i></i><i></i>");
  }
  function mailto(subject, body) {
    return "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject || "") + "&body=" + encodeURIComponent(body || "");
  }

  // Minimal, safe markdown: bold, italics, inline code, links, bullets and
  // paragraphs. Everything is escaped first.
  function renderMarkdown(text) {
    var safe = escapeHtml(text || "");
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
    safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, "$1<em>$2</em>");
    safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    safe = safe.replace(/(^|[^\w">])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    safe = safe.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

    var lines = safe.split("\n");
    var html = "";
    var inList = false;
    var para = [];
    function flushPara() {
      if (para.length) {
        html += "<p>" + para.join("<br>") + "</p>";
        para = [];
      }
    }
    lines.forEach(function (line) {
      var m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
      if (m) {
        flushPara();
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += "<li>" + m[1] + "</li>";
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        if (line.trim() === "") flushPara();
        else para.push(line);
      }
    });
    if (inList) html += "</ul>";
    flushPara();
    return html;
  }

  function setBusy(feature, busy) {
    state.busy[feature] = busy;
    var form = $('.asst-form[data-feature="' + feature + '"]');
    if (!form) return;
    $$("button, input, textarea, select", form).forEach(function (n) {
      n.disabled = busy || state.configured === false;
    });
  }

  async function postJson(url, payload) {
    var res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    var data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* non-JSON error body */
    }
    if (!res.ok) {
      var err = new Error((data && data.error) || "Request failed (" + res.status + ")");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // ---- tabs ----------------------------------------------------------------
  function activateTab(name) {
    $$(".asst-tab").forEach(function (t) {
      t.classList.toggle("is-active", t.getAttribute("data-tab") === name);
    });
    $$(".asst-panel").forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
    });
  }

  // ---- availability --------------------------------------------------------
  function setOffline(reason) {
    state.configured = false;
    var root = $("#assistant-root");
    root.classList.add("is-offline");
    var banner = $("#asst-status");
    banner.innerHTML =
      '<i class="fas fa-plug"></i><div>The assistant is offline right now. You can still reach Daniel at ' +
      '<a href="mailto:' + CONTACT_EMAIL + '" style="color:inherit">' + CONTACT_EMAIL + "</a>." +
      "<small>" + escapeHtml(reason) + "</small></div>";
    banner.hidden = false;
    $$(".asst-form").forEach(function (form) {
      $$("button, input, textarea, select", form).forEach(function (n) {
        n.disabled = true;
      });
    });
  }

  function nudgeBanner() {
    if (!state.open) setOpen(true);
    var banner = $("#asst-status");
    banner.classList.remove("is-pulse");
    void banner.offsetWidth; // restart the animation
    banner.classList.add("is-pulse");
  }

  async function checkHealth() {
    var banner = $("#asst-status");
    var res;
    try {
      res = await fetch(API.health, { cache: "no-store" });
    } catch (e) {
      return setOffline("The API could not be reached from this page.");
    }
    var data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* HTML 404 or similar */
    }
    if (!data || typeof data.configured === "undefined") {
      return setOffline(
        BASE
          ? "The API at " + BASE + " did not answer as expected."
          : "This host serves static files only; set ASSISTANT_API_BASE in index.html to the deployed API URL."
      );
    }
    if (!data.configured) {
      return setOffline("Missing ANTHROPIC_API_KEY on this deployment.");
    }
    state.configured = true;
    state.mock = !!data.mock;
    if (state.mock) {
      banner.innerHTML = '<i class="fas fa-flask"></i><div>Mock mode: canned responses, no model is being called.</div>';
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  // ---- Chat ----------------------------------------------------------------
  function sourcesLine(list) {
    if (!list || !list.length) return null;
    var wrap = el("div", "sources", "<span>Sources:</span>");
    var seen = {};
    list.forEach(function (s) {
      if (seen[s.id]) return;
      seen[s.id] = true;
      if (s.url) {
        var a = el("a", null, escapeHtml(s.title));
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener";
        wrap.appendChild(a);
      } else {
        wrap.appendChild(el("span", "src", escapeHtml(s.title)));
      }
    });
    return wrap;
  }

  async function runChat(question) {
    var output = $("#chat-output");
    var empty = $(".asst-empty", output);
    if (empty) empty.remove();

    state.chatHistory.push({ role: "user", content: question });
    output.appendChild(el("div", "msg user", escapeHtml(question)));

    var bot = el("div", "msg bot");
    var dots = loadingDots();
    var answer = el("div", "answer");
    bot.appendChild(dots);
    bot.appendChild(answer);
    output.appendChild(bot);
    scrollToEnd(output);
    setBusy("chat", true);

    var text = "";
    var trace = null;
    var calls = {};
    var toolNames = [];
    var sources = [];
    var raf = null;
    function paint() {
      raf = null;
      answer.innerHTML = renderMarkdown(text);
      scrollToEnd(output);
    }
    function schedulePaint() {
      if (!raf) raf = requestAnimationFrame(paint);
    }
    function ensureTrace() {
      if (trace) return trace;
      trace = el("details", "trace");
      trace.appendChild(el("summary", null, '<i class="fas fa-search"></i><span class="trace-label">Looking things up...</span>'));
      bot.appendChild(trace);
      return trace;
    }
    function labelTrace() {
      var label = $(".trace-label", trace);
      if (label) label.textContent = "Looked up: " + toolNames.join(", ");
    }

    function handle(evt) {
      switch (evt.type) {
        case "tool_call": {
          ensureTrace();
          var toolLabel = evt.name.replace(/_/g, " ");
          if (toolNames.indexOf(toolLabel) === -1) toolNames.push(toolLabel);
          labelTrace();
          var call = el("div", "trace-call", "<b>" + escapeHtml(evt.name) + "</b><code>" + escapeHtml(JSON.stringify(evt.input)) + "</code>");
          trace.appendChild(call);
          calls[evt.id] = call;
          scrollToEnd(output);
          break;
        }
        case "tool_result": {
          var node = calls[evt.id];
          if (node) node.appendChild(el("pre", null, escapeHtml(evt.result || "")));
          (evt.sources || []).forEach(function (s) {
            sources.push(s);
          });
          break;
        }
        case "text":
          if (dots.parentNode) dots.remove();
          text += evt.delta;
          schedulePaint();
          break;
        case "done": {
          if (dots.parentNode) dots.remove();
          paint();
          var line = sourcesLine(evt.sources && evt.sources.length ? evt.sources : sources);
          if (line) bot.appendChild(line);
          if (trace) bot.appendChild(trace); // keep the trace below the sources
          break;
        }
        case "error":
          if (dots.parentNode) dots.remove();
          bot.classList.add("error");
          text += (text ? "\n\n" : "") + evt.message;
          paint();
          break;
      }
    }

    try {
      var res = await fetch(API.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: state.chatHistory.slice(-12) }),
      });
      if (!res.ok || !res.body) {
        var data = null;
        try {
          data = await res.json();
        } catch (e) {
          /* ignore */
        }
        throw new Error((data && data.error) || "Request failed (" + res.status + ")");
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      for (;;) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var parts = buffer.split("\n\n");
        buffer = parts.pop();
        parts.forEach(function (part) {
          part.split("\n").forEach(function (line) {
            if (line.indexOf("data: ") === 0) {
              try {
                handle(JSON.parse(line.slice(6)));
              } catch (e) {
                /* malformed line */
              }
            }
          });
        });
      }
      if (text) state.chatHistory.push({ role: "assistant", content: text });
      else state.chatHistory.pop();
    } catch (err) {
      if (dots.parentNode) dots.remove();
      bot.classList.add("error");
      answer.innerHTML = escapeHtml(err.message || "Something went wrong.");
      state.chatHistory.pop();
    } finally {
      setBusy("chat", false);
      scrollToEnd(output);
    }
  }

  // ---- Project fit / Draft: chat-style exchanges ------------------------
  // Each submission becomes a user bubble followed by an assistant reply, so
  // the feed reads like a conversation and several requests can stack up.
  function startExchange(output, userHtml) {
    var empty = $(".asst-empty", output);
    if (empty) empty.remove();
    output.appendChild(el("div", "msg user", userHtml));
    var bot = el("div", "msg bot wide");
    var dots = loadingDots();
    bot.appendChild(dots);
    output.appendChild(bot);
    scrollToEnd(output);
    return { bot: bot, dots: dots };
  }

  function failExchange(output, ex, err, field, value) {
    ex.dots.remove();
    var isHint = err.status && err.status >= 400 && err.status < 500 && err.status !== 429;
    ex.bot.classList.add(isHint ? "notice" : "error");
    ex.bot.appendChild(el("div", "answer", escapeHtml(err.message || "Something went wrong.")));
    if (isHint && field) field.value = value; // hand the text back so it can be extended
    scrollToEnd(output);
  }

  function listBlock(title, items, render) {
    if (!items || !items.length) return "";
    return "<h5>" + title + "</h5><ul>" + items.map(render).join("") + "</ul>";
  }

  async function runFit(text) {
    var output = $("#fit-output");
    var field = $('.asst-form[data-feature="fit"] textarea[name=q]');
    var ex = startExchange(output, escapeHtml(text));
    field.value = "";
    setBusy("fit", true);
    try {
      var data = await postJson(API.fit, { text: text });
      ex.dots.remove();
      var r = data.result;
      var card = el("div", "answer fit");
      card.innerHTML =
        '<div class="fit-head"><span class="badge ' + escapeHtml(r.fit) + '">' + escapeHtml(r.fit) + " fit</span><h4>" + escapeHtml(r.title) + "</h4></div>" +
        "<p>" + escapeHtml(r.summary) + "</p>" +
        listBlock("How Daniel would approach it", r.approach, function (s) {
          return "<li>" + escapeHtml(s) + "</li>";
        }) +
        listBlock("Relevant work", (r.relevant_projects || []).map(function (p) {
          return (p.url ? '<a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener">' + escapeHtml(p.name) + "</a>" : "<strong>" + escapeHtml(p.name) + "</strong>") + " - " + escapeHtml(p.why);
        }).concat((r.relevant_experience || []).map(escapeHtml)), function (s) {
          return "<li>" + s + "</li>";
        }) +
        (r.stack && r.stack.length
          ? '<h5>Suggested stack</h5><div class="chips">' + r.stack.map(function (s) { return "<span>" + escapeHtml(s) + "</span>"; }).join("") + "</div>"
          : "") +
        (r.gaps && r.gaps.length
          ? '<h5>Worth discussing</h5><div class="chips">' + r.gaps.map(function (s) { return '<span class="gap">' + escapeHtml(s) + "</span>"; }).join("") + "</div>"
          : "") +
        '<h5>Next step</h5><p class="muted">' + escapeHtml(r.next_step) + "</p>";

      var cta = el("div", "cta");
      var draftBtn = el("button", "asst-send", '<i class="fas fa-envelope"></i><span>Draft a message about this</span>');
      draftBtn.type = "button";
      draftBtn.addEventListener("click", function () {
        var form = $('.asst-form[data-feature="draft"]');
        $("select[name=purpose]", form).value = "project";
        $("textarea[name=q]", form).value = text;
        activateTab("draft");
        $("textarea[name=q]", form).focus();
      });
      var mail = el("a", "asst-ghost", '<i class="fas fa-external-link-alt"></i><span>Email Daniel directly</span>');
      mail.href = mailto("Project inquiry: " + r.title, "Hi Daniel,\n\n" + text + "\n\n");
      cta.appendChild(draftBtn);
      cta.appendChild(mail);
      card.appendChild(cta);
      ex.bot.appendChild(card);
      scrollToEnd(output);
    } catch (err) {
      failExchange(output, ex, err, field, text);
    } finally {
      setBusy("fit", false);
    }
  }

  async function runDraft(notes, purpose) {
    var output = $("#draft-output");
    var form = $('.asst-form[data-feature="draft"]');
    var field = $("textarea[name=q]", form);
    var purposeSel = $("select[name=purpose]", form);
    var purposeLabel = purposeSel && purposeSel.options[purposeSel.selectedIndex] ? purposeSel.options[purposeSel.selectedIndex].text : "";
    var ex = startExchange(output, (purposeLabel ? "<small>About " + escapeHtml(purposeLabel) + "</small>" : "") + escapeHtml(notes));
    field.value = "";
    setBusy("draft", true);
    try {
      var data = await postJson(API.draft, { purpose: purpose, notes: notes });
      ex.dots.remove();
      var box = el("div", "answer draft");
      box.innerHTML =
        "<label>To</label><input type=\"text\" value=\"" + escapeHtml(data.to || CONTACT_EMAIL) + "\" readonly />" +
        '<label>Subject</label><input type="text" name="subject" value="' + escapeHtml(data.draft.subject) + '" />' +
        '<label>Message (edit as you like)</label><textarea name="body">' + escapeHtml(data.draft.body) + "</textarea>";
      var cta = el("div", "cta");
      // A real mailto: link, kept in sync with the editable subject and body.
      var open = el("a", "asst-send", '<i class="fas fa-external-link-alt"></i><span>Open in my email app</span>');
      function syncMailto() {
        open.href = mailto($("input[name=subject]", box).value, $("textarea[name=body]", box).value);
      }
      syncMailto();
      $("input[name=subject]", box).addEventListener("input", syncMailto);
      $("textarea[name=body]", box).addEventListener("input", syncMailto);
      var copy = el("button", "asst-ghost", '<i class="fas fa-copy"></i><span>Copy</span>');
      copy.type = "button";
      copy.addEventListener("click", function () {
        var textToCopy = "Subject: " + $("input[name=subject]", box).value + "\n\n" + $("textarea[name=body]", box).value;
        var done = function () {
          copy.innerHTML = '<i class="fas fa-check-circle"></i><span>Copied</span>';
          setTimeout(function () {
            copy.innerHTML = '<i class="fas fa-copy"></i><span>Copy</span>';
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(textToCopy).then(done, done);
        else done();
      });
      cta.appendChild(open);
      cta.appendChild(copy);
      box.appendChild(cta);
      box.appendChild(el("span", "asst-note", "Nothing is sent or stored by this site; the message opens in your own email client."));
      ex.bot.appendChild(box);
      scrollToEnd(output);
    } catch (err) {
      failExchange(output, ex, err, field, notes);
    } finally {
      setBusy("draft", false);
    }
  }

  // ---- widget open / close -------------------------------------------------
  function isPhone() {
    return $("#assistant-widget").classList.contains("is-phone");
  }

  function setOpen(open, tab) {
    var widget = $("#assistant-widget");
    var launcher = $("#asst-launcher");
    state.open = open;
    widget.classList.toggle("is-open", open);
    document.body.classList.toggle("asst-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    // fullpage listens for arrow/space keys; hand the keyboard to the widget while it is open
    try {
      if (window.jQuery && jQuery.fn.fullpage && jQuery.fn.fullpage.setKeyboardScrolling) {
        jQuery.fn.fullpage.setKeyboardScrolling(!open);
      }
    } catch (e) {
      /* fullpage not initialised yet */
    }
    if (!open) {
      launcher.focus({ preventScroll: true });
      return;
    }
    if (tab) activateTab(tab);
    if (!state.healthChecked) {
      state.healthChecked = true;
      checkHealth();
    }
    if (!isPhone()) {
      setTimeout(function () {
        var field = $(".asst-panel.is-active input[name=q], .asst-panel.is-active textarea[name=q]");
        if (field && !field.disabled) field.focus({ preventScroll: true });
      }, 220);
    }
  }

  // The site renders phones as a scaled-down 980px layout (no viewport meta
  // tag), which would make a fixed widget tiny. Scale it back up with CSS
  // zoom based on how far the layout viewport exceeds the device width, and
  // switch to a full-screen panel on real phones.
  function applyScale() {
    var widget = $("#assistant-widget");
    var device = (window.screen && window.screen.width) || window.innerWidth;
    var ratio = device / window.innerWidth;
    var zoom = ratio < 0.9 ? Math.min(3, 1 / ratio) : 1;
    widget.style.setProperty("--asst-zoom", String(zoom));
    widget.classList.toggle("is-phone", zoom >= 1.6);
  }

  // ---- wiring --------------------------------------------------------------
  function submit(feature, value, extra) {
    value = (value || "").trim();
    if (!value || state.busy[feature]) return;
    if (state.configured === false) return nudgeBanner();
    if (feature === "chat") runChat(value);
    else if (feature === "fit") runFit(value);
    else if (feature === "draft") runDraft(value, extra && extra.purpose);
  }

  function init() {
    if (!$("#assistant-root")) return;

    $$(".asst-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateTab(tab.getAttribute("data-tab"));
      });
    });

    // Launcher, close button, Escape, and every ".asst-open" link (nav item,
    // capability cards) open or close the widget.
    $("#asst-launcher").addEventListener("click", function () {
      setOpen(true);
    });
    $(".asst-close").addEventListener("click", function () {
      setOpen(false);
    });
    $$(".asst-open").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        setOpen(true, link.getAttribute("data-tab") || undefined);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.open) setOpen(false);
    });
    applyScale();
    window.addEventListener("resize", applyScale);
    window.addEventListener("orientationchange", applyScale);

    $$(".asst-form").forEach(function (form) {
      var feature = form.getAttribute("data-feature");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var field = $("input[name=q], textarea[name=q]", form);
        var purposeSel = $("select[name=purpose]", form);
        submit(feature, field.value, { purpose: purposeSel ? purposeSel.value : undefined });
        if (feature === "chat") field.value = "";
      });
      var ta = $("textarea[name=q]", form);
      if (ta) {
        ta.addEventListener("keydown", function (e) {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") form.requestSubmit();
        });
      }
    });

    // Example chips run a chat question; sample buttons prefill a form.
    // Bound directly on each button: on tall layouts fullpage wraps the
    // section in its scroll-overflow container, which re-dispatches clicks.
    $$(".asst-chips button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        submit("chat", btn.getAttribute("data-prompt") || btn.textContent);
      });
    });
    $$(".asst-sample").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var feature = btn.getAttribute("data-feature");
        var form = $('.asst-form[data-feature="' + feature + '"]');
        var field = form && $("textarea[name=q]", form);
        if (!field) return;
        field.value = feature === "fit" ? SAMPLE_FIT : SAMPLE_DRAFT;
        field.focus();
      });
    });

  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
