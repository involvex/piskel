(function () {
  const ns = $.namespace('pskl.utils.serialization.backward');

  ns.Deserializer_v1 = function (data, callback) {
    this.callback_ = callback;
    this.data_ = data;
  };

  ns.Deserializer_v1.prototype.deserialize = function () {
    const piskelData = this.data_.piskel;
    const descriptor = new pskl.model.piskel.Descriptor(
      'Deserialized piskel',
      ''
    );
    const piskel = new pskl.model.Piskel(
      piskelData.width,
      piskelData.height,
      Constants.DEFAULT.FPS,
      descriptor
    );

    piskelData.layers.forEach(
      (serializedLayer) => {
        const layer = this.deserializeLayer(serializedLayer);
        piskel.addLayer(layer);
      }
    );

    this.callback_(piskel);
  };

  ns.Deserializer_v1.prototype.deserializeLayer = function (layerString) {
    const layerData = JSON.parse(layerString);
    const layer = new pskl.model.Layer(layerData.name);
    layerData.frames.forEach(
      (serializedFrame) => {
        const frame = this.deserializeFrame(serializedFrame);
        layer.addFrame(frame);
      }
    );

    return layer;
  };

  ns.Deserializer_v1.prototype.deserializeFrame = function (frameString) {
    const framePixelGrid = JSON.parse(frameString);
    return pskl.model.Frame.fromPixelGrid(framePixelGrid);
  };
})();
