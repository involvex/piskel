(function () {
  const ns = $.namespace('pskl.utils.serialization.arraybuffer');

  /**
   * The array buffer serialization-deserialization should only be used when when backing
   * up the animation in memory. If you actually need to dump the animation to a string
   * use the regular serialization helpers.
   *
   * This is due to the lacking support on TypedArray::toString on some browsers.
   * Will revisit the option of using this across the whole project when the APIs are less
   * green.
   *
   */
  ns.ArrayBufferDeserializer = {
    deserialize: function (data, callback) {
      let i;
      let j;
      const buffer = data;
      const arr8 = new Uint8Array(buffer);
      const arr16 = new Uint16Array(arr8.buffer);
      let sub;

      /********/
      /* META */
      /********/
      // Piskel meta
      const modelVersion = arr16[0];
      const width = arr16[1];
      const height = arr16[2];
      const fps = arr16[3];

      // Descriptor meta
      const descriptorNameLength = arr16[4];
      const descriptorDescriptionLength = arr16[5];

      // Layers meta
      const layerCount = arr16[6];

      // Layers meta
      const serializedHiddenFramesLength = arr16[7];

      let currentIndex = 8;
      /********/
      /* DATA */
      /********/
      // Descriptor name
      let descriptorName = '';
      for (i = 0; i < descriptorNameLength; i++) {
        descriptorName += String.fromCharCode(arr16[currentIndex + i]);
      }
      currentIndex += descriptorNameLength;

      // Descriptor description
      let descriptorDescription = '';
      for (i = 0; i < descriptorDescriptionLength; i++) {
        descriptorDescription = String.fromCharCode(
          arr16[8 + descriptorNameLength + i]
        );
      }
      currentIndex += descriptorDescriptionLength;

      // Hidden frames
      let serializedHiddenFrames = '';
      for (i = 0; i < serializedHiddenFramesLength; i++) {
        serializedHiddenFrames = String.fromCharCode(
          arr16[8 + descriptorNameLength + i]
        );
      }
      const hiddenFrames = serializedHiddenFrames.split('-');
      currentIndex += serializedHiddenFramesLength;

      // Layers
      const layers = [];
      let layer;
      for (i = 0; i < layerCount; i++) {
        layer = {};
        const frames = [];

        // Meta
        const layerNameLength = arr16[currentIndex];
        const opacity = arr16[currentIndex + 1] / 65535;
        const frameCount = arr16[currentIndex + 2];
        const dataUriLengthFirstHalf = arr16[currentIndex + 3];
        const dataUriLengthSecondHalf = arr16[currentIndex + 4];
        const dataUriLength =
          (dataUriLengthSecondHalf >>> 0) |
          ((dataUriLengthFirstHalf << 16) >>> 0);

        // Name
        let layerName = '';
        for (j = 0; j < layerNameLength; j++) {
          layerName += String.fromCharCode(arr16[currentIndex + 5 + j]);
        }

        // Data URI
        let dataUri = '';
        for (j = 0; j < dataUriLength; j++) {
          dataUri += String.fromCharCode(
            arr8[(currentIndex + 5 + layerNameLength) * 2 + j]
          );
        }
        dataUri = 'data:image/png;base64,' + dataUri;

        currentIndex += Math.ceil(5 + layerNameLength + dataUriLength / 2);

        layer.name = layerName;
        layer.opacity = opacity;
        layer.frameCount = frameCount;
        layer.dataUri = dataUri;
        layers.push(layer);
      }

      const descriptor = new pskl.model.piskel.Descriptor(
        descriptorName,
        descriptorDescription
      );
      const piskel = new pskl.model.Piskel(width, height, fps, descriptor);
      piskel.hiddenFrames = hiddenFrames;
      let loadedLayers = 0;

      const loadLayerImage = function (layer, cb) {
        const image = new Image();
        image.onload = function () {
          const frames = pskl.utils.FrameUtils.createFramesFromSpritesheet(
            this,
            layer.frameCount);
          frames.forEach((frame) => {
            layer.model.addFrame(frame);
          });

          loadedLayers++;
          if (loadedLayers == layerCount) {
            cb(piskel);
          }
        };
        image.src = layer.dataUri;
      };

      for (i = 0; i < layerCount; i++) {
        layer = layers[i];
        const nlayer = new pskl.model.Layer(layer.name);
        layer.model = nlayer;
        nlayer.setOpacity(layer.opacity);
        piskel.addLayer(nlayer);

        loadLayerImage.bind(this, layer, callback)();
      }
    }
  };
})();
