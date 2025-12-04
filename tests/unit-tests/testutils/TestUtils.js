(function () {
  const ns = $.namespace("test.testutils");

  /**
   * Frame.createFromGrid accepts grids that are rotated by 90deg from
   * the visual/usual way. (column-based grid)
   *
   * For testing, it's easier for be able to specify a row-based grid, because
   * it visually matches what the image will look like.
   *
   * For instance :
   *
   * [[black, black, black],
   *  [white, white, white]]
   *
   * we expect this to be a 3x2 image, one black line above a white line.
   *
   * However Frame.createFromGrid needs the following input to create such an image :
   *
   * [[black, white],
   *  [black, white],
   *  [black, white]]
   *
   * This helper will build the second array from the first array.
   */
  ns.toFrameGrid = function (normalGrid) {
    const frameGrid = [];
    const w = normalGrid[0].length;
    const h = normalGrid.length;
    for (let x = 0; x < w; x++) {
      frameGrid[x] = [];
      for (let y = 0; y < h; y++) {
        frameGrid[x][y] = normalGrid[y][x];
      }
    }
    return frameGrid;
  };

  ns.frameEqualsGrid = function (frame, grid) {
    frame.forEachPixel((color, col, row) => {
      ns.colorEqualsColor(color, grid[row][col]);
    });
  };

  ns.imageEqualsGrid = function (image, grid) {
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        const expected = tinycolor(grid[x][y]).toRgbString();
        const color = tinycolor(ns.getRgbaAt(image, x, y)).toRgbString();
        ns.colorEqualsColor(color, expected);
      }
    }
  };

  ns.compareColor = function (colorA, colorB) {
    return pskl.utils.colorToInt(colorA) === pskl.utils.colorToInt(colorB);
  };

  ns.colorEqualsColor = function (color, expected) {
    expect(pskl.utils.colorToInt(color)).toBe(pskl.utils.colorToInt(expected));
  };

  ns.getRgbaAt = function (image, x, y) {
    const w = image.width;
    const h = image.height;
    const canvas = pskl.utils.CanvasUtils.createCanvas(w, h);
    const context = canvas.getContext("2d");

    context.drawImage(image, 0, 0, w, h, 0, 0, w, h);
    const imageData = context.getImageData(0, 0, w, h).data;
    const i = (y * w + x) * 4;

    return {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
      a: imageData[i + 3] / 255,
    };
  };
})();
