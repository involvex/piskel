describe("PixelUtils visitor methods tests", () => {
  const black = "#000000";
  const red = "#ff0000";
  const transparent = Constants.TRANSPARENT_COLOR;
  const B = black,
    R = red,
    T = transparent;

  beforeEach(() => {});
  afterEach(() => {});

  const containsPixel = function (pixels, col, row) {
    return pixels.some((p) => {
      return p.col === col && p.row === row;
    });
  };

  it("getSimilarConnectedPixelsFromFrame works", () => {
    const frame = pskl.model.Frame.fromPixelGrid(
      test.testutils.toFrameGrid([
        [T, T, B],
        [B, T, B],
        [T, T, B],
      ])
    );

    let pixels = pskl.PixelUtils.getSimilarConnectedPixelsFromFrame(
      frame,
      0,
      0
    );
    expect(pixels.length).toBe(5);
    expect(containsPixel(pixels, 0, 0)).toBe(true);
    expect(containsPixel(pixels, 1, 0)).toBe(true);
    expect(containsPixel(pixels, 1, 1)).toBe(true);
    expect(containsPixel(pixels, 0, 2)).toBe(true);
    expect(containsPixel(pixels, 1, 2)).toBe(true);

    pixels = pskl.PixelUtils.getSimilarConnectedPixelsFromFrame(frame, -1, -1);
    expect(Array.isArray(pixels)).toBe(true);
    expect(pixels.length).toBe(0);

    pixels = pskl.PixelUtils.getSimilarConnectedPixelsFromFrame(frame, 0, 1);
    expect(pixels.length).toBe(1);
    expect(containsPixel(pixels, 0, 1)).toBe(true);

    pixels = pskl.PixelUtils.getSimilarConnectedPixelsFromFrame(frame, 2, 1);
    expect(pixels.length).toBe(3);
    expect(containsPixel(pixels, 2, 0)).toBe(true);
    expect(containsPixel(pixels, 2, 1)).toBe(true);
    expect(containsPixel(pixels, 2, 2)).toBe(true);
  });
});
