(function () {
  const ns = $.namespace('pskl.utils.serialization');

  ns.Deserializer = function (data, callback) {
    this.layersToLoad_ = 0;
    this.data_ = data;
    this.callback_ = callback;
    this.piskel_ = null;
    this.layers_ = [];
  };

  ns.Deserializer.deserialize = function (data, onSuccess, onError) {
    try {
      let deserializer;
      if (data.modelVersion == Constants.MODEL_VERSION) {
        deserializer = new ns.Deserializer(data, onSuccess);
      } else if (data.modelVersion == 1) {
        deserializer = new ns.backward.Deserializer_v1(data, onSuccess);
      } else {
        deserializer = new ns.backward.Deserializer_v0(data, onSuccess);
      }
      deserializer.deserialize();
    } catch (e) {
      console.error(e);
      if (typeof onError === 'function') {
        onError(e);
      }
    }
  };

  ns.Deserializer.prototype.deserialize = function () {
    const data = this.data_;
    const piskelData = data.piskel;
    const name = piskelData.name || 'Deserialized piskel';
    const description = piskelData.description || '';
    const fps = typeof piskelData.fps != 'undefined' ? piskelData.fps : 12;

    const descriptor = new pskl.model.piskel.Descriptor(name, description);
    this.piskel_ = new pskl.model.Piskel(
      piskelData.width,
      piskelData.height,
      fps,
      descriptor
    );
    this.hiddenFrames = piskelData.hiddenFrames || [];

    this.layersToLoad_ = piskelData.layers.length;
    piskelData.layers.forEach(this.deserializeLayer.bind(this));
  };

  ns.Deserializer.prototype.deserializeLayer = function (layerString, index) {
    const layerData = JSON.parse(layerString);
    const layer = new pskl.model.Layer(layerData.name);
    layer.setOpacity(layerData.opacity);

    // Backward compatibility: if the layerData is not chunked but contains a single base64PNG,
    // create a fake chunk, expected to represent all frames side-by-side.
    if (typeof layerData.chunks === 'undefined' && layerData.base64PNG) {
      this.normalizeLayerData_(layerData);
    }

    const chunks = layerData.chunks;

    // Prepare a frames array to store frame objects extracted from the chunks.
    const frames = [];
    Q.all(
      chunks.map((chunk) => {
        // Create a promise for each chunk.
        const deferred = Q.defer();
        const image = new Image();
        // Load the chunk image in an Image object.
        image.onload = function () {
          // extract the chunkFrames from the chunk image
          const chunkFrames = pskl.utils.FrameUtils.createFramesFromChunk(
            image,
            chunk.layout
          );
          // add each image to the frames array, at the extracted index
          chunkFrames.forEach((chunkFrame) => {
            frames[chunkFrame.index] = chunkFrame.frame;
          });
          deferred.resolve();
        };
        image.src = chunk.base64PNG;
        return deferred.promise;
      })
    )
      .then(
        () => {
          frames.forEach((frame) => {
            layer.addFrame(frame);
          });
          this.layers_[index] = layer;
          this.onLayerLoaded_();
        }
      )
      .catch((error) => {
        console.error('Failed to deserialize layer');
        console.error(error);
      });

    return layer;
  };

  ns.Deserializer.prototype.onLayerLoaded_ = function () {
    this.layersToLoad_ = this.layersToLoad_ - 1;
    if (this.layersToLoad_ === 0) {
      this.layers_.forEach(
        (layer) => {
          this.piskel_.addLayer(layer);
        });
      this.piskel_.hiddenFrames = this.hiddenFrames;
      this.callback_(this.piskel_);
    }
  };

  /**
   * Backward comptibility only. Create a chunk for layerData objects that only contain
   * an single base64PNG without chunk/layout information.
   */
  ns.Deserializer.prototype.normalizeLayerData_ = function (layerData) {
    const layout = [];
    for (let i = 0; i < layerData.frameCount; i++) {
      layout.push([i]);
    }
    layerData.chunks = [
      {
        base64PNG: layerData.base64PNG,
        layout: layout
      }
    ];
  };
})();
