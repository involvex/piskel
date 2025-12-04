(function () {
  const ns = $.namespace('pskl.service.palette.reader');

  ns.AbstractPaletteFileReader = function (
    file,
    onSuccess,
    onError,
    colorLineRegexp
  ) {
    this.file = file;
    this.onSuccess = onSuccess;
    this.onError = onError;
    this.colorLineRegexp = colorLineRegexp;
  };

  ns.AbstractPaletteFileReader.prototype.extractColorFromLine =
    Constants.ABSTRACT_FUNCTION;

  ns.AbstractPaletteFileReader.prototype.read = function () {
    pskl.utils.FileUtils.readFile(this.file, this.onFileLoaded_.bind(this));
  };

  ns.AbstractPaletteFileReader.prototype.onFileLoaded_ = function (content) {
    const text = pskl.utils.Base64.toText(content);
    const lines = text.match(/[^\r\n]+/g);

    const colorLines = lines.filter(
      (l) => {
        return this.colorLineRegexp.test(l);
      });
    const colors = colorLines.map(this.extractColorFromLine.bind(this));

    if (colors.length) {
      const uuid = pskl.utils.Uuid.generate();
      const palette = new pskl.model.Palette(uuid, this.file.name, colors);
      this.onSuccess(palette);
    } else {
      this.onError();
    }
  };
})();
