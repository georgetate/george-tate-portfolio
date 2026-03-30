// horizontal-gallery.js
// Builds single-row horizontal scroll galleries for sections marked with
// .js-horizontal-gallery. Images are declared in a hidden .project-gallery-source
// element and moved into a visible .project-gallery-track as styled items.

(function () {

  // Creates a single gallery item div containing a copy of the source image.
  function makeGalleryItem(sourceImg) {
    var item = document.createElement('div');
    item.className = 'project-gallery-item';

    var img = document.createElement('img');
    img.src = sourceImg.currentSrc || sourceImg.src;
    img.alt = sourceImg.alt || '';
    img.loading = sourceImg.loading || 'lazy';
    img.decoding = 'async';

    item.appendChild(img);
    return item;
  }

  // Reads all source images from a section, renders them into the track,
  // then sets the initial scroll position (start or end based on data-start).
  function buildGallery(section) {
    var source = section.querySelector('.project-gallery-source');
    var track = section.querySelector('.project-gallery-track');
    var scroll = section.querySelector('.project-gallery-scroll');
    if (!source || !track) return;

    var sourceImages = Array.from(source.querySelectorAll('img'));
    if (!sourceImages.length) return;

    // Build all items off-DOM first for a single reflow
    var fragment = document.createDocumentFragment();
    sourceImages.forEach(function (img) {
      fragment.appendChild(makeGalleryItem(img));
    });
    track.replaceChildren(fragment);

    // Set initial scroll position after the browser has laid out the track
    if (scroll) {
      requestAnimationFrame(function () {
        if (section.dataset.start === 'end') {
          scroll.scrollLeft = scroll.scrollWidth; // start scrolled to the last image
        } else {
          scroll.scrollLeft = 0;                  // start scrolled to the first image
        }
      });
    }

    section.classList.add('is-ready');
  }

  // Find and build every horizontal gallery on the page
  function init() {
    var galleries = document.querySelectorAll('.js-horizontal-gallery');
    galleries.forEach(buildGallery);
  }

  // Run after the DOM is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
