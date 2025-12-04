(function () {
  const ns = $.namespace('pskl.service.palette.reader');

  ns.PaletteImageReader = function (file, onSuccess, onError) {
    this.file = file;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.colorSorter_ = new pskl.service.color.ColorSorter();
  };

  ns.PaletteImageReader.prototype.read = function () {
    pskl.utils.FileUtils.readImageFile(
      this.file,
      this.onImageLoaded_.bind(this));
  };

  ns.PaletteImageReader.prototype.onImageLoaded_ = function (image) {
    const imageProcessor = new pskl.worker.imageprocessor.ImageProcessor(
      image,
      this.onWorkerSuccess_.bind(this),
      this.onWorkerStep_.bind(this),
      this.onWorkerError_.bind(this));
    $.publish(Events.SHOW_PROGRESS, [{ name: 'Processing image colors ...' }]);

    imageProcessor.process();
  };

  ns.PaletteImageReader.prototype.onWorkerSuccess_ = function (event) {
    const data = event.data;
    const colorsMap = data.colorsMap;

    const colors = Object.keys(colorsMap);

    if (colors.length > Constants.MAX_PALETTE_COLORS) {
      this.onError('Too many colors : ' + colors.length);
    } else {
      const uuid = pskl.utils.Uuid.generate();
      const sortedColors = this.colorSorter_.sort(colors);
      const palette = new pskl.model.Palette(
        uuid,
        this.file.name + ' palette',
        sortedColors);
      this.onSuccess(palette);
    }
    $.publish(Events.HIDE_PROGRESS);
  };

  ns.PaletteImageReader.prototype.onWorkerStep_ = function (event) {
    const progress = event.data.progress;
    $.publish(Events.UPDATE_PROGRESS, [{ progress: progress }]);
  };

  ns.PaletteImageReader.prototype.onWorkerError_ = function (event) {
    $.publish(Events.HIDE_PROGRESS);
    this.onError('Unable to process the image : ' + event.data.message);
  };
})();
