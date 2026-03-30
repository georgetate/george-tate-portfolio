// horizontal-masonry.js
// Enhances the photo gallery from its CSS grid fallback to an
// aspect-ratio-balanced two-row horizontal masonry layout.
//
// Fallback state (no JS): images sit directly in .photo-gallery-track and
// are arranged by the CSS grid (2 rows, filling top-to-bottom then scrolling
// right).
//
// Enhanced state (JS runs): this script reads the images already in the
// track, measures each one's aspect ratio, distributes them across two rows
// so total widths balance, then replaces the track contents with
// .photo-gallery-row > .photo-gallery-item structures. The section receives
// .is-ready which switches the track from grid to flex layout via CSS.

(function () {

  // Loads an image off-screen to read its natural dimensions.
  // Resolves with metadata including aspect ratio and portrait/landscape flag.
  function loadImageMeta(img) {
    return new Promise(function (resolve) {
      var loader = new Image();

      function finish() {
        resolve({
          src: img.currentSrc || img.src,
          alt: img.alt || '',
          loading: img.loading,
          isPortrait: loader.naturalHeight >= loader.naturalWidth,
          aspectRatio: loader.naturalWidth / loader.naturalHeight || 1
        });
      }

      loader.addEventListener('load', finish, { once: true });
      loader.addEventListener('error', finish, { once: true }); // resolve even on broken images
      loader.src = img.currentSrc || img.src;
    });
  }

  // Distributes images across two rows by greedily adding each image to
  // whichever row has the smaller total aspect-ratio sum.
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
  //   1. Read images already in the track
  //   2. Load each to measure its aspect ratio
  //   3. Distribute into two balanced rows
  //   4. Replace track contents with the new row structure
  function layoutGallery(gallery) {
    var track = gallery.querySelector('.photo-gallery-track');
    var scroll = gallery.querySelector('.photo-gallery-scroll');
    if (!track) return;

    // Read the images that are already in the track (fallback state)
    var sourceImages = Array.from(track.querySelectorAll('img'));
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

      // Replace the flat list of imgs with the two-row structure
      track.replaceChildren(fragment);

      // Always start scrolled to the first image
      if (scroll) {
        scroll.scrollLeft = 0;
      }

      // Triggers CSS switch from grid fallback to flex enhanced layout
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
