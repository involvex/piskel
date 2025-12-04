(function () {
  const ns = $.namespace('pskl.service.palette');

  ns.PaletteGplWriter = function (palette) {
    this.palette = palette;
  };

  ns.PaletteGplWriter.prototype.write = function () {
    const lines = [];
    lines.push('GIMP Palette');
    lines.push('Name: ' + this.palette.name);
    lines.push('Columns: 0');
    lines.push('#');
    this.palette.getColors().forEach(
      (color) => {
        lines.push(this.writeColorLine(color));
      });
    lines.push('\r\n');

    return lines.join('\r\n');
  };

  ns.PaletteGplWriter.prototype.writeColorLine = function (color) {
    const tinycolor = window.tinycolor(color);
    const rgb = tinycolor.toRgb();
    const strBuffer = [];
    strBuffer.push(this.padString(rgb.r, 3));
    strBuffer.push(this.padString(rgb.g, 3));
    strBuffer.push(this.padString(rgb.b, 3));
    strBuffer.push('Untitled');

    return strBuffer.join(' ');
  };

  ns.PaletteGplWriter.prototype.padString = function (str, size) {
    str = str.toString();
    const pad = new Array(1 + size - str.length).join(' ');
    return pad + str;
  };
})();
