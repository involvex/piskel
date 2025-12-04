/**
 * @provide pskl.tools.drawing.DitheringTool
 *
 * @require pskl.utils
 */
(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.DitheringTool = function () {
    ns.SimplePen.call(this);
    this.toolId = 'tool-dithering';
    this.helpText = 'Dithering tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.DITHERING;
  };

  pskl.utils.inherit(ns.DitheringTool, ns.SimplePen);

  ns.DitheringTool.prototype.supportsDynamicPenSize = function () {
    return true;
  };

  /**
   * @override
   */
  ns.DitheringTool.prototype.applyToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    this.previousCol = col;
    this.previousRow = row;

    const penSize = pskl.app.penSizeService.getPenSize();
    const points = pskl.PixelUtils.resizePixel(col, row, penSize);
    points.forEach(
      (point) => {
        this.applyToolOnPixel(point[0], point[1], frame, overlay, event);
      });
  };

  ns.DitheringTool.prototype.applyToolOnPixel = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    let usePrimaryColor = (col + row) % 2;

    if (pskl.app.mouseStateService.isRightButtonPressed()) {
      usePrimaryColor = !usePrimaryColor;
    }

    const ditheringColor = usePrimaryColor ?
      pskl.app.selectedColorsService.getPrimaryColor() :
      pskl.app.selectedColorsService.getSecondaryColor();

    this.draw(ditheringColor, col, row, frame, overlay);
  };
})();
