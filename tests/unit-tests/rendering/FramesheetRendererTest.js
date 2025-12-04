describe("Framesheet Renderer test", () => {
  const B = "#000000";
  const W = "#ffffff";
  const T = Constants.TRANSPARENT_COLOR;

  const toFrameGrid = test.testutils.toFrameGrid;
  const frameEqualsGrid = test.testutils.frameEqualsGrid;

  beforeEach(() => {});
  afterEach(() => {});

  const toFrame = function (array) {
    return pskl.model.Frame.fromPixelGrid(toFrameGrid(array));
  };

  it("draws frames side by side by default", () => {
    // create frames
    const f1 = toFrame([
      [B, T],
      [B, W],
    ]);
    const f2 = toFrame([
      [W, B],
      [T, B],
    ]);

    const renderer = new pskl.rendering.FramesheetRenderer([f1, f2]);
    const canvas = renderer.renderAsCanvas();
    frameEqualsGrid(pskl.utils.FrameUtils.createFromImage(canvas), [
      [B, T, W, B],
      [B, W, T, B],
    ]);
  });

  it("renderAsCanvas accepts columns argument", () => {
    // create frames
    const f1 = toFrame([[B, B]]);
    const f2 = toFrame([[W, W]]);
    const f3 = toFrame([[T, W]]);
    const f4 = toFrame([[B, W]]);
    const frames = [f1, f2, f3, f4];

    // columns = 4
    let renderer = new pskl.rendering.FramesheetRenderer(frames);
    let canvas = renderer.renderAsCanvas(4);
    frameEqualsGrid(pskl.utils.FrameUtils.createFromImage(canvas), [
      [B, B, W, W, T, W, B, W],
    ]);

    // columns = 3
    renderer = new pskl.rendering.FramesheetRenderer(frames);
    canvas = renderer.renderAsCanvas(3);
    frameEqualsGrid(pskl.utils.FrameUtils.createFromImage(canvas), [
      [B, B, W, W, T, W],
      [B, W, T, T, T, T],
    ]);

    // columns = 2
    renderer = new pskl.rendering.FramesheetRenderer(frames);
    canvas = renderer.renderAsCanvas(2);
    frameEqualsGrid(pskl.utils.FrameUtils.createFromImage(canvas), [
      [B, B, W, W],
      [T, W, B, W],
    ]);

    // columns = 1
    renderer = new pskl.rendering.FramesheetRenderer(frames);
    canvas = renderer.renderAsCanvas(1);
    frameEqualsGrid(pskl.utils.FrameUtils.createFromImage(canvas), [
      [B, B],
      [W, W],
      [T, W],
      [B, W],
    ]);
  });
});
