/**
 * @provide pskl.tools.drawing.SimplePen
 *
 * @require pskl.utils
 */
(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.SimplePen = function () {
    this.toolId = 'tool-pen';
    this.helpText = 'Pen tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.PEN;

    this.previousCol = null;
    this.previousRow = null;

    this.pixels = [];
  };

  pskl.utils.inherit(ns.SimplePen, ns.BaseTool);

  ns.SimplePen.prototype.supportsDynamicPenSize = function () {
    return true;
  };

  /**
   * @override
   */
  ns.SimplePen.prototype.applyToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    this.previousCol = col;
    this.previousRow = row;

    const color = this.getToolColor();

    this.drawUsingPenSize(color, col, row, frame, overlay);
  };

  ns.SimplePen.prototype.drawUsingPenSize = function (
    color,
    col,
    row,
    frame,
    overlay
  ) {
    const penSize = pskl.app.penSizeService.getPenSize();
    const points = pskl.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(
      (point) => {
        this.draw(color, point[0], point[1], frame, overlay);
      });
  };

  ns.SimplePen.prototype.draw = function (color, col, row, frame, overlay) {
    overlay.setPixel(col, row, color);
    if (color === Constants.TRANSPARENT_COLOR) {
      frame.setPixel(col, row, color);
    }
    this.pixels.push({
      col: col,
      row: row,
      color: color
    });
  };

  /**
   * @override
   */
  ns.SimplePen.prototype.moveToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    if (
      Math.abs(col - this.previousCol) > 1 ||
      Math.abs(row - this.previousRow) > 1
    ) {
      // The pen movement is too fast for the mousemove frequency, there is a gap between the
      // current point and the previously drawn one.
      // We fill the gap by calculating missing dots (simple linear interpolation) and draw them.
      const interpolatedPixels = pskl.PixelUtils.getLinePixels(
        col,
        this.previousCol,
        row,
        this.previousRow);
      for (let i = 0, l = interpolatedPixels.length; i < l; i++) {
        const coords = interpolatedPixels[i];
        this.applyToolAt(coords.col, coords.row, frame, overlay, event);
      }
    } else {
      this.applyToolAt(col, row, frame, overlay, event);
    }

    this.previousCol = col;
    this.previousRow = row;
  };

  ns.SimplePen.prototype.releaseToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    // apply on real frame
    this.setPixelsToFrame_(frame, this.pixels);

    // save state
    this.raiseSaveStateEvent({
      pixels: this.pixels.slice(0),
      color: this.getToolColor()
    });

    // reset
    this.resetUsedPixels_();
  };

  ns.SimplePen.prototype.replay = function (frame, replayData) {
    this.setPixelsToFrame_(frame, replayData.pixels, replayData.color);
  };

  ns.SimplePen.prototype.setPixelsToFrame_ = function (frame, pixels, color) {
    pixels.forEach((pixel) => {
      frame.setPixel(pixel.col, pixel.row, pixel.color);
    });
  };

  ns.SimplePen.prototype.resetUsedPixels_ = function () {
    this.pixels = [];
  };
})();
