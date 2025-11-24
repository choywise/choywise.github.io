let lazyImages = [] ;
let inAdvance = 0;

function lazyLoad() {
  lazyImages.forEach((image) => {
    if (image.offsetTop < window.innerHeight + window.pageYOffset + inAdvance && !$(image).hasClass('loaded')) {
      image.src = image.dataset.src;
      image.onload = () => image.classList.add("loaded");
    }
  });
}

$(document).ready(function(){
	lazyImages = [...document.querySelectorAll("img")];
	lazyLoad();
})

document.addEventListener("scroll", lazyLoad);
window.addEventListener("resize", lazyLoad);
window.addEventListener("orientationchange", lazyLoad);
