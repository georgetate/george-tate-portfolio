(function () {
  function getConfig() {
    const w = window.innerWidth;
    if (w <= 420) return { cols: 2, gap: 8 };
    if (w <= 700) return { cols: 2, gap: 10 };
    return { cols: 3, gap: 14 };
  }

  function layout() {
    const grid = document.querySelector('.photo-grid');
    if (!grid) return;

    const { cols, gap } = getConfig();
    const items = Array.from(grid.querySelectorAll('.photo-item'));
    const gridWidth = grid.offsetWidth;
    const colWidth = (gridWidth - gap * (cols - 1)) / cols;
    const colHeights = new Array(cols).fill(0);

    items.forEach(function (item) {
      // Find the shortest column
      var minH = Math.min.apply(null, colHeights);
      var col = colHeights.indexOf(minH);

      item.style.position = 'absolute';
      item.style.width = colWidth + 'px';
      item.style.left = (col * (colWidth + gap)) + 'px';
      item.style.top = colHeights[col] + 'px';

      colHeights[col] += item.offsetHeight + gap;
    });

    // Set container height to tallest column (minus the trailing gap)
    grid.style.height = (Math.max.apply(null, colHeights) - gap) + 'px';
  }

  function init() {
    var grid = document.querySelector('.photo-grid');
    if (!grid) return;

    // Container needs relative positioning for absolute children
    grid.style.position = 'relative';

    // Run an initial layout pass (handles fully-cached images)
    layout();

    // Re-layout as each lazy-loaded image finishes
    var imgs = grid.querySelectorAll('img');
    imgs.forEach(function (img) {
      if (!img.complete) {
        img.addEventListener('load', layout);
        img.addEventListener('error', layout);
      }
    });

    // Re-layout on resize (debounced)
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
