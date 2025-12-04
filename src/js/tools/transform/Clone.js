(function () {
  const ns = $.namespace('pskl.tools.transform');

  ns.Clone = function () {
    this.toolId = 'tool-clone';
    this.helpText = 'Clone current layer to all frames';
    this.tooltipDescriptors = [];
  };

  pskl.utils.inherit(ns.Clone, ns.AbstractTransformTool);

  ns.Clone.prototype.applyTool_ = function (altKey, allFrames, allLayers) {
    const ref = pskl.app.piskelController.getCurrentFrame();
    const layer = pskl.app.piskelController.getCurrentLayer();
    layer.getFrames().forEach((frame) => {
      if (frame !== ref) {
        frame.setPixels(ref.getPixels());
      }
    });
  };
})();
