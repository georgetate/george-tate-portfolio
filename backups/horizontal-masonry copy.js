// horizontal-masonry.js
// Builds two-row horizontal masonry galleries for sections marked with
// .js-horizontal-masonry. Each image is loaded to measure its aspect ratio,
// then images are distributed across two rows so their total widths balance,
// and finally rendered into a visible .photo-gallery-track.

(function () {

  // Loads a source image off-screen to read its natural dimensions.
  // Resolves with metadata including aspect ratio and portrait/landscape flag.
  function loadImageMeta(sourceImg) {
    return new Promise(function (resolve) {
      var loader = new Image();

      function finish() {
        resolve({
          src: sourceImg.currentSrc || sourceImg.src,
          alt: sourceImg.alt || '',
          loading: sourceImg.loading,
          isPortrait: loader.naturalHeight >= loader.naturalWidth,
          aspectRatio: loader.naturalWidth / loader.naturalHeight || 1
        });
      }

      loader.addEventListener('load', finish, { once: true });
      loader.addEventListener('error', finish, { once: true }); // resolve even on broken images
      loader.src = sourceImg.currentSrc || sourceImg.src;
    });
  }

  // Distributes images across two rows by greedily adding each image to
  // whichever row currently has the smaller total aspect-ratio sum.
  // This keeps row widths balanced so both rows scroll the same distance.
  function buildRows(items) {
    var rows = [[], []];
    var rowWidths = [0, 0];

    items.forEach(function (item) {
      var targetRow = rowWidths[0] <= rowWidths[1] ? 0 : 1;
      rows[targetRow].push(item);
      rowWidths[targetRow] += item.aspectRatio;
    });

    return rows;
  }

  // Creates a photo card div for a single image, tagged with orientation class.
  function makePhotoCard(item) {
    var card = document.createElement('div');
    card.className = 'photo-gallery-item ' + (item.isPortrait ? 'is-portrait' : 'is-landscape');

    var img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = item.loading || 'lazy';
    img.decoding = 'async';

    card.appendChild(img);
    return card;
  }

  // Orchestrates the full pipeline for one gallery section:
  //   1. Load all source images to get aspect ratios
  //   2. Distribute into two balanced rows
  //   3. Render rows into the track
  function layoutGallery(gallery) {
    var source = gallery.querySelector('.photo-gallery-source');
    var track = gallery.querySelector('.photo-gallery-track');
    var scroll = gallery.querySelector('.photo-gallery-scroll');
    if (!source || !track) return;

    var sourceImages = Array.from(source.querySelectorAll('img'));
    if (!sourceImages.length) return;

    // Wait for all images to report their natural dimensions before laying out
    Promise.all(sourceImages.map(loadImageMeta)).then(function (items) {
      var rows = buildRows(items);

      // Build both rows off-DOM first for a single reflow
      var fragment = document.createDocumentFragment();
      rows.forEach(function (rowItems) {
        var row = document.createElement('div');
        row.className = 'photo-gallery-row';

        rowItems.forEach(function (item) {
          row.appendChild(makePhotoCard(item));
        });

        fragment.appendChild(row);
      });

      track.replaceChildren(fragment);

      // Always start scrolled to the first image
      if (scroll) {
        scroll.scrollLeft = 0;
      }

      gallery.classList.add('is-ready');
    });
  }

  // Find and lay out every masonry gallery on the page
  function init() {
    var galleries = document.querySelectorAll('.js-horizontal-masonry');
    galleries.forEach(layoutGallery);
  }

  // Run after the DOM is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
