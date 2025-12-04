describe("Palette Service", () => {
  let paletteService = null;
  let localStorage = {};

  let localStorageGlobal;

  const addPalette = function (id, name, color) {
    const palette = new pskl.model.Palette(id, name, [color]);
    paletteService.savePalette(palette);
  };

  const verifyPaletteIsStored = function (paletteId) {
    const palette = paletteService.getPaletteById(paletteId);
    expect(palette).not.toBeNull();
    return palette;
  };

  const verifyPaletteIsNotStored = function (paletteId) {
    const palette = paletteService.getPaletteById(paletteId);
    expect(palette).toBeNull();
  };

  beforeEach(() => {
    localStorage = {};

    localStorageGlobal = {
      getItem: function (key) {
        if (localStorage.hasOwnProperty(key)) {
          return localStorage[key];
        } else {
          return null;
        }
      },
      setItem: function (key, item) {
        localStorage[key] = item;
      },
    };

    paletteService = new pskl.service.palette.PaletteService();
    paletteService.localStorageGlobal = localStorageGlobal;
  });

  it("returns an empty array when no palette is stored", () => {
    spyOn(localStorageGlobal, "getItem").and.callThrough();

    const palettes = paletteService.getPalettes();
    expect(Array.isArray(palettes)).toBe(true);
    expect(palettes.length).toBe(0);
    expect(localStorageGlobal.getItem).toHaveBeenCalled();
  });

  it("can store a palette", () => {
    // when
    spyOn(localStorageGlobal, "setItem").and.callThrough();

    const paletteId = "palette-id";
    const paletteName = "palette-name";
    const paletteColor = "#001122";

    // then
    addPalette(paletteId, paletteName, paletteColor);
    const palettes = paletteService.getPalettes();

    // verify
    expect(localStorageGlobal.setItem).toHaveBeenCalled();

    expect(Array.isArray(palettes)).toBe(true);
    expect(palettes.length).toBe(1);

    const retrievedPalette = paletteService.getPaletteById(paletteId);
    expect(retrievedPalette).toBeDefined();
    expect(retrievedPalette.id).toBe(paletteId);
    expect(retrievedPalette.name).toBe(paletteName);

    const colors = retrievedPalette.getColors();
    expect(Array.isArray(colors)).toBe(true);
    expect(colors.length).toBe(1);

    const color = colors[0];
    expect(color).toBe(paletteColor);
  });

  it("updates a palette", () => {
    // when
    const paletteId = "palette-id";
    const paletteName = "palette-name";
    const paletteColor1 = "#001122";
    const paletteColor2 = "#334455";

    // then
    addPalette(paletteId, paletteName, paletteColor1);
    addPalette(paletteId, paletteName, paletteColor2);

    // verify
    const palettes = paletteService.getPalettes();
    expect(palettes.length).toBe(1);

    const retrievedPalette = paletteService.getPaletteById(paletteId);
    const color = retrievedPalette.get(0);
    expect(color).toBe(paletteColor2);
  });

  it("can delete a palette", () => {
    // when
    addPalette("palette-id", "palette-name", ["#001122"]);

    // then
    paletteService.deletePaletteById("palette-id");

    // verify
    const palettes = paletteService.getPalettes();
    expect(palettes.length).toBe(0);
  });

  it("attempts to delete unexisting palette without side effect", () => {
    // when
    addPalette("palette-id", "palette-name", ["#001122"]);

    // then
    const palettes = paletteService.getPalettes();
    paletteService.deletePaletteById("some-other-palette-id");

    // verify
    expect(palettes.length).toBe(1);
  });

  it("deletes the correct palette when several palettes are stored", () => {
    // when
    addPalette("palette-id-0", "palette-name-0", ["#000000"]);
    addPalette("palette-id-1", "palette-name-1", ["#111111"]);
    addPalette("palette-id-2", "palette-name-2", ["#222222"]);

    // then
    paletteService.deletePaletteById("palette-id-1");

    // verify
    const palettes = paletteService.getPalettes();
    expect(palettes.length).toBe(2);
    verifyPaletteIsStored("palette-id-0");
    verifyPaletteIsNotStored("palette-id-1");
    verifyPaletteIsStored("palette-id-2");
  });
});
