(function () {
  const ns = $.namespace('pskl.utils');

  ns.LayerUtils = {
    clone: function (layer) {
      const clonedFrames = layer.getFrames().map((frame) => {
        return frame.clone();
      });
      return pskl.model.Layer.fromFrames(
        layer.getName() + ' (clone)',
        clonedFrames
      );
    },

    mergeLayers: function (layerA, layerB) {
      const framesA = layerA.getFrames();
      const framesB = layerB.getFrames();
      const mergedFrames = [];
      framesA.forEach((frame, index) => {
        const otherFrame = framesB[index];
        mergedFrames.push(pskl.utils.FrameUtils.merge([otherFrame, frame]));
      });
      const mergedLayer = pskl.model.Layer.fromFrames(
        layerA.getName(),
        mergedFrames
      );
      return mergedLayer;
    },

    getFrameHashAt: function (layers, index) {
      const hashBuffer = [];
      layers.forEach((l) => {
        const frame = l.getFrameAt(index);
        hashBuffer.push(frame.getHash());
        hashBuffer.push(l.getOpacity());
        return frame;
      });
      return hashBuffer.join('-');
    },

    /**
     * Create a frame instance merging all the frames from the layers array at
     * the provided index.
     *
     * @param  {Array<Layer>} layers array of layers to use
     * @param  {Number} index frame index to merge
     * @return {Frame} Frame instance (can be a fake frame when using
     *         transparency)
     */
    mergeFrameAt: function (layers, index) {
      const isTransparent = layers.some((l) => {
        return l.isTransparent();
      });
      if (isTransparent) {
        return pskl.utils.LayerUtils.mergeTransparentFrameAt_(layers, index);
      } else {
        return pskl.utils.LayerUtils.mergeOpaqueFrameAt_(layers, index);
      }
    },

    mergeTransparentFrameAt_: function (layers, index) {
      const hash = pskl.utils.LayerUtils.getFrameHashAt(layers, index);
      const width = layers[0].frames[0].getWidth();
      const height = layers[0].frames[0].getHeight();
      const renderFn = function () {
        return pskl.utils.LayerUtils.flattenFrameAt(layers, index, true);
      };
      return new pskl.model.frame.RenderedFrame(renderFn, width, height, hash);
    },

    mergeOpaqueFrameAt_: function (layers, index) {
      const hash = pskl.utils.LayerUtils.getFrameHashAt(layers, index);
      const frames = layers.map((l) => {
        return l.getFrameAt(index);
      });
      const mergedFrame = pskl.utils.FrameUtils.merge(frames);
      mergedFrame.id = hash;
      mergedFrame.version = 0;
      return mergedFrame;
    },

    renderFrameAt: function (layer, index, preserveOpacity) {
      const opacity = preserveOpacity ? layer.getOpacity() : 1;
      const frame = layer.getFrameAt(index);
      return pskl.utils.FrameUtils.toImage(frame, 1, opacity);
    },

    flattenFrameAt: function (layers, index, preserveOpacity) {
      const width = layers[0].getFrameAt(index).getWidth();
      const height = layers[0].getFrameAt(index).getHeight();
      const canvas = pskl.utils.CanvasUtils.createCanvas(width, height);

      const context = canvas.getContext('2d');
      layers.forEach((l) => {
        const render = ns.LayerUtils.renderFrameAt(l, index, preserveOpacity);
        context.drawImage(render, 0, 0, width, height, 0, 0, width, height);
      });

      return canvas;
    }
  };
})();
