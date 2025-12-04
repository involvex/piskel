(function () {
  const ns = $.namespace('pskl.utils.serialization.backward');

  ns.Deserializer_v0 = function (data, callback) {
    this.data_ = data;
    this.callback_ = callback;
  };

  ns.Deserializer_v0.prototype.deserialize = function () {
    const pixelGrids = this.data_;
    const frames = pixelGrids.map((grid) => {
      return pskl.model.Frame.fromPixelGrid(grid);
    });
    const descriptor = new pskl.model.piskel.Descriptor(
      'Deserialized piskel',
      ''
    );
    const layer = pskl.model.Layer.fromFrames('Layer 1', frames);

    this.callback_(
      pskl.model.Piskel.fromLayers([layer], Constants.DEFAULT.FPS, descriptor)
    );
  };
})();
