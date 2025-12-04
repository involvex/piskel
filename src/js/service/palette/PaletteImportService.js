(function () {
  const ns = $.namespace('pskl.service.palette');

  const fileReaders = {
    gpl: ns.reader.PaletteGplReader,
    pal: ns.reader.PalettePalReader,
    txt: ns.reader.PaletteTxtReader,
    img: ns.reader.PaletteImageReader
  };

  ns.PaletteImportService = function () {};
  ns.PaletteImportService.prototype.init = function () {};

  ns.PaletteImportService.prototype.read = function (file, onSuccess, onError) {
    const reader = this.getReader_(file, onSuccess, onError);
    if (reader) {
      reader.read();
    } else {
      console.error('Could not find reader for file : %s', file.name);
    }
  };

  ns.PaletteImportService.prototype.isImage_ = function (file) {
    return file.type.indexOf('image') === 0;
  };

  ns.PaletteImportService.prototype.getReader_ = function (
    file,
    onSuccess,
    onError
  ) {
    const ReaderClass = this.getReaderClass_(file);
    if (ReaderClass) {
      return new ReaderClass(file, onSuccess, onError);
    } else {
      return null;
    }
  };

  ns.PaletteImportService.prototype.getReaderClass_ = function (file) {
    let ReaderClass;
    if (this.isImage_(file)) {
      ReaderClass = fileReaders.img;
    } else {
      const extension = this.getExtension_(file);
      ReaderClass = fileReaders[extension];
    }
    return ReaderClass;
  };

  ns.PaletteImportService.prototype.getExtension_ = function (file) {
    const parts = file.name.split('.');
    const extension = parts[parts.length - 1];
    return extension.toLowerCase();
  };
})();
