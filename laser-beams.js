// ------ Laser beams ------
// Draws "laser beams" that bounce between the two horizontal bars of the header and
// footer bands. Each beam starts by dying into one of the bars (so the beams stop short
// of the name instead of needing a vertical divider), then zigzags to the right edge,
// picking a slightly different angle at every bounce for a hand-drawn randomness.
//
// The angles come from a seeded random generator, so the pattern is identical on every
// page load; only the visible length changes with the screen width. Each band redraws
// when its size changes, because the bounce points depend on the band's width and height.

(function () {
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  var STROKE_WIDTH = 2.5;

  // Beam angles are measured from the horizontal. Below ~25 degrees the beams turn into
  // long flat streaks; above ~65 degrees they look like vertical hatching.
  var MIN_ANGLE_DEGREES = 28;
  var MAX_ANGLE_DEGREES = 62;

  // Where each beam dies into a bar, as a multiple of the band height from the band's
  // left edge, and which bar it dies into. Staggered so the ends do not line up.
  var BEAMS = [
    { startOffset: 0.0, startsAtTop: true, seed: 11 },
    { startOffset: 0.55, startsAtTop: false, seed: 29 },
    { startOffset: 1.3, startsAtTop: true, seed: 47 },
  ];

  // Small seeded PRNG (mulberry32): returns a function giving floats in [0, 1).
  function createRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      var mixed = Math.imul(state ^ (state >>> 15), 1 | state);
      mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildBeamPoints(beam, bandWidth, bandHeight) {
    var random = createRandom(beam.seed);
    var currentX = beam.startOffset * bandHeight;
    var isAtTop = beam.startsAtTop;
    var points = [[currentX, isAtTop ? 0 : bandHeight]];

    // Keep bouncing until the beam has left the band on the right.
    while (currentX <= bandWidth) {
      var angleDegrees = MIN_ANGLE_DEGREES + random() * (MAX_ANGLE_DEGREES - MIN_ANGLE_DEGREES);
      var horizontalRun = bandHeight / Math.tan(angleDegrees * Math.PI / 180);
      currentX += horizontalRun;
      isAtTop = !isAtTop;
      points.push([currentX, isAtTop ? 0 : bandHeight]);
    }
    return points;
  }

  function drawBeams(band) {
    var bandWidth = band.clientWidth;
    var bandHeight = band.clientHeight;
    if (bandWidth === 0 || bandHeight === 0) return;

    var svg = band.querySelector('svg') || document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + bandWidth + ' ' + bandHeight);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '';

    BEAMS.forEach(function (beam) {
      var polyline = document.createElementNS(SVG_NAMESPACE, 'polyline');
      var pointText = buildBeamPoints(beam, bandWidth, bandHeight)
        .map(function (point) { return point[0].toFixed(1) + ',' + point[1].toFixed(1); })
        .join(' ');
      polyline.setAttribute('points', pointText);
      polyline.setAttribute('fill', 'none');
      polyline.setAttribute('stroke', 'currentColor');
      polyline.setAttribute('stroke-width', STROKE_WIDTH);
      // Mitered corners keep each bounce a sharp point where it touches the bar.
      polyline.setAttribute('stroke-linejoin', 'miter');
      svg.appendChild(polyline);
    });

    if (!svg.parentNode) band.appendChild(svg);
  }

  var bands = document.querySelectorAll('.js-laser-beams');
  var resizeObserver = new ResizeObserver(function (entries) {
    entries.forEach(function (entry) { drawBeams(entry.target); });
  });
  bands.forEach(function (band) {
    drawBeams(band);
    resizeObserver.observe(band);
  });
})();
