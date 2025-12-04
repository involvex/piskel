(function () {
  const ns = $.namespace('pskl.tools.transform');

  ns.AbstractTransformTool = function () {};

  pskl.utils.inherit(ns.AbstractTransformTool, pskl.tools.Tool);

  ns.AbstractTransformTool.prototype.applyTransformation = function (evt) {
    const allFrames = evt.shiftKey;
    const allLayers = pskl.utils.UserAgent.isMac ? evt.metaKey : evt.ctrlKey;

    this.applyTool_(evt.altKey, allFrames, allLayers);

    $.publish(Events.PISKEL_RESET);

    this.raiseSaveStateEvent({
      altKey: evt.altKey,
      allFrames: allFrames,
      allLayers: allLayers
    });
  };

  ns.AbstractTransformTool.prototype.applyTool_ = function (
    altKey,
    allFrames,
    allLayers
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
            this.applyToolOnFrame_(frame, altKey);
          }
        );
      }
    );
  };

  ns.AbstractTransformTool.prototype.replay = function (frame, replayData) {
    this.applyTool_(
      replayData.altKey,
      replayData.allFrames,
      replayData.allLayers
    );
  };
})();
