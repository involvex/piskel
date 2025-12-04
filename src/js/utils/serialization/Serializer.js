(function () {
  const ns = $.namespace('pskl.utils.serialization');

  const areChunksValid = function (chunks) {
    return (
      chunks.length &&
      chunks.every((chunk) => {
        return chunk.base64PNG && chunk.base64PNG !== 'data:,';
      })
    );
  };

  const createLineLayout = function (size, offset) {
    const layout = [];
    for (let i = 0; i < size; i++) {
      layout.push([i + offset]);
    }

    return layout;
  };

  ns.Serializer = {
    serialize: function (piskel) {
      const serializedLayers = piskel.getLayers().map((l) => {
        return pskl.utils.serialization.Serializer.serializeLayer(l);
      });

      return JSON.stringify({
        modelVersion: Constants.MODEL_VERSION,
        piskel: {
          name: piskel.getDescriptor().name,
          description: piskel.getDescriptor().description,
          fps: pskl.app.piskelController.getFPS(),
          height: piskel.getHeight(),
          width: piskel.getWidth(),
          layers: serializedLayers,
          hiddenFrames: piskel.hiddenFrames
        }
      });
    },

    serializeLayer: function (layer) {
      const frames = layer.getFrames();
      const layerToSerialize = {
        name: layer.getName(),
        opacity: layer.getOpacity(),
        frameCount: frames.length
      };

      // A layer spritesheet data can be chunked in case the spritesheet PNG is to big to be
      // converted to a dataURL.
      // Frames are divided equally amongst chunks and each chunk is converted to a spritesheet
      // PNG. If any chunk contains an invalid base64 PNG, we increase the number of chunks and
      // retry.
      let chunks = [];
      while (!areChunksValid(chunks)) {
        if (chunks.length >= frames.length) {
          // Something went horribly wrong.
          chunks = [];
          break;
        }

        // Chunks are invalid, increase the number of chunks by one, and chunk the frames array.
        const frameChunks = pskl.utils.Array.chunk(frames, chunks.length + 1);

        // Reset chunks array.
        chunks = [];

        // After each chunk update the offset by te number of frames that have been processed.
        let offset = 0;
        for (let i = 0; i < frameChunks.length; i++) {
          const chunkFrames = frameChunks[i];
          chunks.push({
            // create a layout array, containing the indices of the frames extracted in this chunk
            layout: createLineLayout(chunkFrames.length, offset),
            base64PNG: ns.Serializer.serializeFramesToBase64(chunkFrames)
          });

          offset += chunkFrames.length;
        }
      }

      layerToSerialize.chunks = chunks;
      return JSON.stringify(layerToSerialize);
    },

    serializeFramesToBase64: function (frames) {
      try {
        const renderer = new pskl.rendering.FramesheetRenderer(frames);
        return renderer.renderAsCanvas().toDataURL();
      } catch (e) {
        return '';
      }
    }
  };
})();
