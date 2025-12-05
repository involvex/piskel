(function () {
  const ns = $.namespace('pskl.service.performance');

/**
   * We consider that piskel should behave correctly for a sprite with following specs:
   * - 512*512 (increased from 256*256 for better performance)
   * - 60 frames (increased from 30)
   * - 10 layers (increased from 5)
   * - 64 colors (increased from 30)
   * Based on these assumptions, as well as a few arbitrary hard limits we try to check
   * if provided sprite might present a performance issue.
   *
   * @param {Piskel} piskel sprite to analyze
   * @param {Number} colorsCount number of colors for current sprite
   *        (not part of piskel model so has to be provided separately).
   */
  ns.PerformanceReport = function (piskel, colorsCount) {
    const pixels = piskel.getWidth() * piskel.getHeight();
    this.resolution = pixels > 1024 * 1024; // Increased threshold

    const layersCount = piskel.getLayers().length;
    this.layers = layersCount > 20; // Increased threshold

    const framesCount = piskel.getLayerAt(0).size();
    this.frames = framesCount > 200; // Increased threshold

    this.colors = colorsCount >= 128; // Increased threshold

    const overallScore =
      pixels / 5240 + layersCount * 2 + framesCount / 2 + (colorsCount * 50) / 128;
    this.overall = overallScore > 400; // Increased threshold
  };

  ns.PerformanceReport.prototype.equals = function (report) {
    return (
      report instanceof ns.PerformanceReport &&
      this.resolution == report.resolution &&
      this.layers == report.layers &&
      this.frames == report.frames &&
      this.colors == report.colors &&
      this.overall == report.overall
    );
  };

  ns.PerformanceReport.prototype.hasProblem = function () {
    return (
      this.resolution ||
      this.layers ||
      this.frames ||
      this.colors ||
      this.overall
    );
  };
})();
