describe("FrameUtils suite", () => {
  const black = "#000000";
  const red = "#ff0000";
  const transparent = Constants.TRANSPARENT_COLOR;

  // shortcuts
  const toFrameGrid = test.testutils.toFrameGrid;
  const frameEqualsGrid = test.testutils.frameEqualsGrid;

  it("merges 2 frames", () => {
    const B = black,
      R = red,
      T = transparent;
    const frame1 = pskl.model.Frame.fromPixelGrid([
      [B, T],
      [T, B],
    ]);

    const frame2 = pskl.model.Frame.fromPixelGrid([
      [T, R],
      [R, T],
    ]);

    const mergedFrame = pskl.utils.FrameUtils.merge([frame1, frame2]);
    frameEqualsGrid(mergedFrame, [
      [B, R],
      [R, B],
    ]);
  });

  it("returns same frame when merging single frame", () => {
    const B = black,
      T = transparent;
    const frame1 = pskl.model.Frame.fromPixelGrid(
      toFrameGrid([
        [B, T],
        [B, T],
      ])
    );

    const mergedFrame = pskl.utils.FrameUtils.merge([frame1]);
    frameEqualsGrid(mergedFrame, [
      [B, T],
      [B, T],
    ]);
  });

  const checkPixelsColor = function (frame, pixels, color) {
    pixels.forEach((pixel) => {
      const pixelColor = frame.getPixel(pixel[0], pixel[1]);
      expect(pixelColor).toBe(color);
    });
  };

  it("converts an image to a frame", () => {
    const B = black,
      T = transparent;
    const frame1 = pskl.model.Frame.fromPixelGrid([
      [B, T],
      [T, B],
    ]);

    const image = pskl.utils.FrameUtils.toImage(frame1);
    expect(image.width).toBe(2);
    expect(image.height).toBe(2);

    const biggerImage = pskl.utils.FrameUtils.toImage(frame1, 3);
    expect(biggerImage.width).toBe(6);
    expect(biggerImage.height).toBe(6);

    const biggerFrame = pskl.utils.FrameUtils.createFromImage(biggerImage);

    frameEqualsGrid(biggerFrame, [
      [B, B, B, T, T, T],
      [B, B, B, T, T, T],
      [B, B, B, T, T, T],
      [T, T, T, B, B, B],
      [T, T, T, B, B, B],
      [T, T, T, B, B, B],
    ]);
  });

  it("[LayerUtils] creates frames from a simple spritesheet", () => {
    const B = black,
      R = red;

    // original image in 4x2
    const frame = pskl.model.Frame.fromPixelGrid(
      toFrameGrid([
        [B, R, B, R],
        [R, B, B, R],
      ])
    );

    const spritesheet = pskl.utils.FrameUtils.toImage(frame);

    // split the spritesheet by 4
    const frames = pskl.utils.FrameUtils.createFramesFromSpritesheet(
      spritesheet,
      4
    );

    // expect 4 frames of 1x2
    expect(frames.length).toBe(4);

    // verify frame content
    frameEqualsGrid(frames[0], [[B], [R]]);
    frameEqualsGrid(frames[1], [[R], [B]]);
    frameEqualsGrid(frames[2], [[B], [B]]);
    frameEqualsGrid(frames[3], [[R], [R]]);
  });

  it("supports null values in frame array", () => {
    const B = black,
      T = transparent;
    const frame = pskl.model.Frame.fromPixelGrid([
      [B, null],
      [null, B],
    ]);

    const image = pskl.utils.FrameUtils.toImage(frame);

    // transform back to frame for ease of testing
    const testFrame = pskl.utils.FrameUtils.createFromImage(image);
    frameEqualsGrid(testFrame, [
      [B, T],
      [T, B],
    ]);
  });
});
