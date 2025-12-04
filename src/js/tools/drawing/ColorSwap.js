/**
 * @provide pskl.tools.drawing.ColorSwap
 *
 */
(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.ColorSwap = function () {
    this.toolId = 'tool-colorswap';
    this.helpText = 'Paint all pixels of the same color';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.COLORSWAP;

    this.tooltipDescriptors = [
      { key: 'ctrl', description: 'Apply to all layers' },
      { key: 'shift', description: 'Apply to all frames' }
    ];
  };

  pskl.utils.inherit(ns.ColorSwap, ns.BaseTool);

  /**
   * @override
   */
  ns.ColorSwap.prototype.applyToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    if (frame.containsPixel(col, row)) {
      const oldColor = frame.getPixel(col, row);
      const newColor = this.getToolColor();

      const allLayers = pskl.utils.UserAgent.isMac ?
        event.metaKey :
        event.ctrlKey;
      const allFrames = event.shiftKey;
      this.swapColors_(oldColor, newColor, allLayers, allFrames);

      this.raiseSaveStateEvent({
        allLayers: allLayers,
        allFrames: allFrames,
        oldColor: oldColor,
        newColor: newColor
      });
    }
  };

  ns.ColorSwap.prototype.replay = function (frame, replayData) {
    this.swapColors_(
      replayData.oldColor,
      replayData.newColor,
      replayData.allLayers,
      replayData.allFrames);
  };

  ns.ColorSwap.prototype.swapColors_ = function (
    oldColor,
    newColor,
    allLayers,
    allFrames
  ) {
    const currentFrameIndex = pskl.app.piskelController.getCurrentFrameIndex();
    const layers = allLayers ?
      pskl.app.piskelController.getLayers() :
      [pskl.app.piskelController.getCurrentLayer()];
    layers.forEach(
      (layer) => {
        const frames = allFrames ?
          layer.getFrames() :
          [layer.getFrameAt(currentFrameIndex)];
        frames.forEach(
          (frame) => {
            this.applyToolOnFrame_(frame, oldColor, newColor);
          });
      });
  };

  ns.ColorSwap.prototype.applyToolOnFrame_ = function (
    frame,
    oldColor,
    newColor
  ) {
    oldColor = pskl.utils.colorToInt(oldColor);
    newColor = pskl.utils.colorToInt(newColor);
    frame.forEachPixel((color, col, row) => {
      if (color !== null && color == oldColor) {
        frame.setPixel(col, row, newColor);
      }
    });
  };
})();
