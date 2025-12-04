describe("MergeUtils suite", () => {
  const B = "#000000";
  const R = "#ff0000";
  const T = Constants.TRANSPARENT_COLOR;

  const createPiskelFromGrid = function (grid, name) {
    const frame = pskl.model.Frame.fromPixelGrid(grid);
    const layer = pskl.model.Layer.fromFrames("l1", [frame]);
    return pskl.model.Piskel.fromLayers([layer], 12, {
      name: name || "piskel",
      description: "desc",
    });
  };

  /**
   * Simple helper to create a monochrome sprite for the provided color,
   * number of rows and columns.
   */
  const getPiskel = function (color, rows, cols) {
    const grid = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = color;
      }
    }
    return createPiskelFromGrid(grid);
  };

  it("merges 2 piskel - insertMode:add same size", () => {
    const piskel1 = getPiskel(B, 2, 2);
    const piskel2 = getPiskel(R, 2, 2);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "add",
    });

    expect(mergedPiskel.getWidth()).toBe(2);
    expect(mergedPiskel.getHeight()).toBe(2);
    expect(mergedPiskel.getLayers().length).toBe(2);
    expect(mergedPiskel.getLayers()[0].getFrames().length).toBe(2);
  });

  it("merges 2 piskel - insertMode:insert same size", () => {
    const piskel1 = getPiskel(B, 2, 2);
    const piskel2 = getPiskel(R, 2, 2);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(2);
    expect(mergedPiskel.getHeight()).toBe(2);
    expect(mergedPiskel.getLayers().length).toBe(2);
    expect(mergedPiskel.getLayers()[0].getFrames().length).toBe(1);
  });

  it("merges 2 piskel - resize:expand with bigger imported piskel", () => {
    const piskel1 = getPiskel(B, 2, 2);
    const piskel2 = getPiskel(R, 4, 4);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(4);
    expect(mergedPiskel.getHeight()).toBe(4);
  });

  it("merges 2 piskel - resize:keep with bigger imported piskel", () => {
    const piskel1 = getPiskel(B, 2, 2);
    const piskel2 = getPiskel(R, 4, 4);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "keep",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(2);
    expect(mergedPiskel.getHeight()).toBe(2);
  });

  it("merges 2 piskel - resize:expand with taller but thinner imported piskel", () => {
    const piskel1 = getPiskel(B, 2, 2);
    const piskel2 = getPiskel(R, 1, 4);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(2);
    expect(mergedPiskel.getHeight()).toBe(4);
  });

  it("merges 2 piskel - resize:expand with wider but shorter imported piskel", () => {
    const piskel1 = getPiskel(B, 2, 2);
    const piskel2 = getPiskel(R, 4, 1);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(4);
    expect(mergedPiskel.getHeight()).toBe(2);
  });

  it("merges 2 piskel - resize:expand with bigger original piskel", () => {
    const piskel1 = getPiskel(B, 3, 3);
    const piskel2 = getPiskel(R, 1, 1);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "expand",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(3);
    expect(mergedPiskel.getHeight()).toBe(3);
  });

  it("merges 2 piskel - resize:keep with bigger original piskel", () => {
    const piskel1 = getPiskel(B, 3, 3);
    const piskel2 = getPiskel(R, 1, 1);

    const mergedPiskel = pskl.utils.MergeUtils.merge(piskel1, piskel2, {
      index: 0,
      resize: "keep",
      origin: "TOPLEFT",
      insertMode: "insert",
    });

    expect(mergedPiskel.getWidth()).toBe(3);
    expect(mergedPiskel.getHeight()).toBe(3);
  });
});
