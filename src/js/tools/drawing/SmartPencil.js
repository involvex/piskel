/**
 * @provide pskl.tools.drawing.SmartPencil
 *
 * @require pskl.utils
 */
(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.SmartPencil = function () {
    this.toolId = 'tool-smart-pencil';
    this.helpText = 'Smart Pencil tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.PEN;

    this.previousCol = null;
    this.previousRow = null;

    this.pixels = [];
    this.startingColor = null;
    this.invertedColor = null;
  };

  pskl.utils.inherit(ns.SmartPencil, ns.BaseTool);

  ns.SmartPencil.prototype.supportsDynamicPenSize = function () {
    return true;
  };

  /**
   * @override
   */
  ns.SmartPencil.prototype.onMouseDown = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    // Get the starting pixel color
    this.startingColor = frame.getPixel(col, row);

    // Determine the color to use based on smart logic
    const colorToUse = this.getSmartColor_(this.startingColor);

    // Store the inverted color for reference
    this.invertedColor = this.invertColor_(this.startingColor);

    // Apply the smart color logic
    this.applyToolAt(col, row, frame, overlay, event, colorToUse);
  };

  /**
   * Get the smart color based on the starting pixel
   */
  ns.SmartPencil.prototype.getSmartColor_ = function (startingColor) {
    // If starting color is transparent, use primary color
    if (startingColor === Constants.TRANSPARENT_COLOR) {
      return this.getToolColor();
    }

    // Otherwise, invert the starting color
    return this.invertColor_(startingColor);
  };

  /**
   * Invert a color
   */
  ns.SmartPencil.prototype.invertColor_ = function (color) {
    if (color === Constants.TRANSPARENT_COLOR) {
      return Constants.TRANSPARENT_COLOR;
    }

    // Simple RGB inversion for non-transparent colors
    const rgb = pskl.utils.ColorUtils.hexToRgb(color);
    const invertedRgb = {
      r: 255 - rgb.r,
      g: 255 - rgb.g,
      b: 255 - rgb.b,
    };
    return pskl.utils.ColorUtils.rgbToHex(
      invertedRgb.r,
      invertedRgb.g,
      invertedRgb.b
    );
  };

  /**
   * @override
   */
  ns.SmartPencil.prototype.applyToolAt = function (
    col,
    row,
    frame,
    overlay,
    event,
    color
  ) {
    this.previousCol = col;
    this.previousRow = row;

    // Use the provided color or get the smart color
    const colorToUse = color || this.getSmartColor_(frame.getPixel(col, row));

    this.drawUsingPenSize(colorToUse, col, row, frame, overlay);
  };

  ns.SmartPencil.prototype.drawUsingPenSize = function (
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
      }
    );
  };

  ns.SmartPencil.prototype.draw = function (color, col, row, frame, overlay) {
    overlay.setPixel(col, row, color);
    if (color === Constants.TRANSPARENT_COLOR) {
      frame.setPixel(col, row, color);
    }
    this.pixels.push({
      col: col,
      row: row,
      color: color,
    });
  };

  /**
   * @override
   */
  ns.SmartPencil.prototype.moveToolAt = function (
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
        this.previousRow
      );
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

  /**
   * @override
   */
  ns.SmartPencil.prototype.releaseToolAt = function (
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
      color: this.getToolColor(),
    });

    // reset
    this.resetUsedPixels_();
  };

  ns.SmartPencil.prototype.replay = function (frame, replayData) {
    this.setPixelsToFrame_(frame, replayData.pixels, replayData.color);
  };

  ns.SmartPencil.prototype.setPixelsToFrame_ = function (frame, pixels, color) {
    pixels.forEach((pixel) => {
      frame.setPixel(pixel.col, pixel.row, pixel.color);
    });
  };

  ns.SmartPencil.prototype.resetUsedPixels_ = function () {
    this.pixels = [];
    this.startingColor = null;
    this.invertedColor = null;
  };
})();
