(function () {
  const ns = $.namespace('pskl.selection');

  const OUTSIDE = -1;
  const INSIDE = 1;
  const VISITED = 2;

  ns.LassoSelection = function (pixels, frame) {
    // transform the selected pixels array to a Map to get a faster lookup
    this.pixelsMap = {};
    pixels.forEach(
      (pixel) => {
        this.setPixelInMap_(pixel, INSIDE);
      });
    this.pixels = this.getLassoPixels_(frame);
  };

  pskl.utils.inherit(ns.LassoSelection, ns.BaseSelection);

  ns.LassoSelection.prototype.getLassoPixels_ = function (frame) {
    const lassoPixels = [];

    frame.forEachPixel(
      (color, pixelCol, pixelRow) => {
        const pixel = { col: pixelCol, row: pixelRow };
        if (this.isInSelection_(pixel, frame)) {
          lassoPixels.push(pixel);
        }
      });
    return lassoPixels;
  };

  ns.LassoSelection.prototype.isInSelection_ = function (pixel, frame) {
    const alreadyVisited = this.getPixelInMap_(pixel);
    if (!alreadyVisited) {
      this.visitPixel_(pixel, frame);
    }

    return this.getPixelInMap_(pixel) == INSIDE;
  };

  ns.LassoSelection.prototype.visitPixel_ = function (pixel, frame) {
    let frameBorderReached = false;
    const visitedPixels = pskl.PixelUtils.visitConnectedPixels(
      pixel,
      frame,
      (connectedPixel) => {
        const alreadyVisited = this.getPixelInMap_(connectedPixel);
        if (alreadyVisited) {
          return false;
        }

        if (!frame.containsPixel(connectedPixel.col, connectedPixel.row)) {
          frameBorderReached = true;
          return false;
        }

        this.setPixelInMap_(connectedPixel, VISITED);
        return true;
      });
    visitedPixels.forEach(
      (visitedPixel) => {
        this.setPixelInMap_(
          visitedPixel,
          frameBorderReached ? OUTSIDE : INSIDE);
      });
  };

  ns.LassoSelection.prototype.setPixelInMap_ = function (pixel, value) {
    this.pixelsMap[pixel.col] = this.pixelsMap[pixel.col] || {};
    this.pixelsMap[pixel.col][pixel.row] = value;
  };

  ns.LassoSelection.prototype.getPixelInMap_ = function (pixel) {
    return this.pixelsMap[pixel.col] && this.pixelsMap[pixel.col][pixel.row];
  };
})();
