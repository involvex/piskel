describe("LayerUtils test", () => {
  const B = "#000000";
  const R = "#ff0000";
  const T = Constants.TRANSPARENT_COLOR;
  const frameEqualsGrid = test.testutils.frameEqualsGrid;
  const imageEqualsGrid = test.testutils.imageEqualsGrid;

  const frame1 = pskl.model.Frame.fromPixelGrid([
    [B, T],
    [T, B],
  ]);

  const frame2 = pskl.model.Frame.fromPixelGrid([
    [T, R],
    [R, T],
  ]);

  beforeEach(() => {});
  afterEach(() => {});

  it("flattens a frame", () => {
    // when
    const l1 = new pskl.model.Layer("l1");
    l1.addFrame(frame1);
    const l2 = new pskl.model.Layer("l2");
    l2.addFrame(frame2);

    // then
    const flattened = pskl.utils.LayerUtils.flattenFrameAt([l1, l2], 0);

    //verify
    imageEqualsGrid(flattened, [
      [B, R],
      [R, B],
    ]);
  });

  it("flattens a frame with opacity", () => {
    // when
    const l1 = new pskl.model.Layer("l1");
    l1.addFrame(frame1);
    const l2 = new pskl.model.Layer("l2");
    l2.setOpacity(0.5);
    l2.addFrame(frame2);

    // then
    const flattened = pskl.utils.LayerUtils.flattenFrameAt([l1, l2], 0, true);

    //verify
    imageEqualsGrid(flattened, [
      [B, "rgba(255,0,0,0.5)"],
      ["rgba(255,0,0,0.5)", B],
    ]);
  });

  it("clones a layer", () => {
    const grid1 = [
      [B, T],
      [T, B],
    ];

    const grid2 = [
      [R, B],
      [B, R],
    ];

    // when
    const layer = new pskl.model.Layer("l1");
    layer.addFrame(pskl.model.Frame.fromPixelGrid(grid1));
    layer.addFrame(pskl.model.Frame.fromPixelGrid(grid2));

    // then
    const clone = pskl.utils.LayerUtils.clone(layer);
    const clonedFrame = clone.getFrameAt(0);

    // verify
    frameEqualsGrid(clone.getFrameAt(0), grid1);
    frameEqualsGrid(clone.getFrameAt(1), grid2);
    expect(clone.getName()).toBe("l1 (clone)");
  });
});
