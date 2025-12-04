(function () {
  const ns = $.namespace('pskl.service.palette');

  ns.PaletteService = function () {
    this.dynamicPalettes = [];
    // Exposed for tests.
    this.localStorageGlobal = window.localStorage;
  };

  ns.PaletteService.prototype.getPalettes = function () {
    const palettesString = this.localStorageGlobal.getItem('piskel.palettes');
    let palettes = JSON.parse(palettesString) || [];
    palettes = palettes.map((palette) => {
      return pskl.model.Palette.fromObject(palette);
    });

    return this.dynamicPalettes.concat(palettes);
  };

  ns.PaletteService.prototype.getPaletteById = function (paletteId) {
    const palettes = this.getPalettes();
    return this.findPaletteInArray_(paletteId, palettes);
  };

  ns.PaletteService.prototype.savePalette = function (palette) {
    const palettes = this.getPalettes();
    const existingPalette = this.findPaletteInArray_(palette.id, palettes);
    if (existingPalette) {
      const currentIndex = palettes.indexOf(existingPalette);
      palettes.splice(currentIndex, 1, palette);
    } else {
      palettes.push(palette);
    }

    this.savePalettes_(palettes);

    $.publish(Events.SHOW_NOTIFICATION, [
      { content: 'Palette ' + palette.name + ' successfully saved !' }
    ]);
    window.setTimeout($.publish.bind($, Events.HIDE_NOTIFICATION), 2000);
  };

  ns.PaletteService.prototype.addDynamicPalette = function (palette) {
    this.dynamicPalettes.push(palette);
  };

  ns.PaletteService.prototype.deletePaletteById = function (id) {
    const palettes = this.getPalettes();
    const filteredPalettes = palettes.filter((palette) => {
      return palette.id !== id;
    });

    this.savePalettes_(filteredPalettes);
  };

  ns.PaletteService.prototype.savePalettes_ = function (palettes) {
    palettes = palettes.filter(
      (palette) => {
        return this.dynamicPalettes.indexOf(palette) === -1;
      });
    this.localStorageGlobal.setItem(
      'piskel.palettes',
      JSON.stringify(palettes));
    $.publish(Events.PALETTE_LIST_UPDATED);
  };

  ns.PaletteService.prototype.findPaletteInArray_ = function (
    paletteId,
    palettes
  ) {
    let match = null;

    palettes.forEach((palette) => {
      if (palette.id === paletteId) {
        match = palette;
      }
    });

    return match;
  };
})();
