/**
 * @provide pskl.tools.drawing.Rectangle
 *
 * @require pskl.utils
 */
(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.Rectangle = function () {
    ns.ShapeTool.call(this);

    this.toolId = 'tool-rectangle';
    this.helpText = 'Rectangle tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.RECTANGLE;
  };

  pskl.utils.inherit(ns.Rectangle, ns.ShapeTool);

  /**
   * @override
   */
  ns.Rectangle.prototype.draw = function (
    col,
    row,
    color,
    targetFrame,
    penSize
  ) {
    const rectangle = pskl.PixelUtils.getOrderedRectangleCoordinates(
      this.startCol,
      this.startRow,
      col,
      row);
    for (let x = rectangle.x0; x <= rectangle.x1; x++) {
      for (let y = rectangle.y0; y <= rectangle.y1; y++) {
        if (
          x > rectangle.x1 - penSize ||
          x < rectangle.x0 + penSize ||
          y > rectangle.y1 - penSize ||
          y < rectangle.y0 + penSize
        ) {
          targetFrame.setPixel(x, y, color);
        }
      }
    }
  };
})();
