// horizontal-gallery.js
// Sets the initial scroll position for single-row horizontal galleries.
// Images are already structured in .project-gallery-track in the HTML,
// so no DOM construction is needed — this script only handles scroll position.

(function () {

  // Sets the scroll position of the gallery based on data-start attribute.
  // Force-loads all images first (same technique as horizontal-masonry.js)
  // so scrollWidth is accurate before the position is applied.
  function initGallery(section) {
    var scroll = section.querySelector('.project-gallery-scroll');
    if (!scroll) return;

    section.classList.add('is-ready');

    var images = Array.from(section.querySelectorAll('.project-gallery-track img'));

    // Create off-screen loaders for any image that hasn't fully loaded yet,
    // mirroring the loadImageMeta approach in horizontal-masonry.js
    var loaders = images.map(function (img) {
      return new Promise(function (resolve) {
        if (img.complete && img.naturalWidth > 0) { resolve(); return; }
        var loader = new Image();
        loader.addEventListener('load',  resolve, { once: true });
        loader.addEventListener('error', resolve, { once: true });
        loader.src = img.src;
      });
    });

    Promise.all(loaders).then(function () {
      scroll.scrollLeft = section.dataset.start === 'end' ? scroll.scrollWidth : 0;
    });
  }

  // Find and initialise every horizontal gallery on the page
  function init() {
    var galleries = document.querySelectorAll('.js-horizontal-gallery');
    galleries.forEach(initGallery);
  }

  // Run after the DOM is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
