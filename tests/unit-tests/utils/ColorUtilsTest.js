describe("Color utils", () => {
  beforeEach(() => {});
  afterEach(() => {});

  it("returns a color when provided with array of colors", () => {
    // when/then
    let unusedColor = pskl.utils.ColorUtils.getUnusedColor([
      "#ffff00",
      "#feff00",
      "#fdff00",
    ]);
    // verify
    expect(unusedColor).toBe("#FCFF00");

    // when/then
    unusedColor = pskl.utils.ColorUtils.getUnusedColor([
      "#fcff00",
      "#feff00",
      "#fdff00",
    ]);
    // verify
    expect(unusedColor).toBe("#FFFF00");
  });

  it("returns a color for an empty array", () => {
    // when/then
    let unusedColor = pskl.utils.ColorUtils.getUnusedColor([]);
    // verify
    expect(unusedColor).toBe("#FFFF00");

    // when/then
    unusedColor = pskl.utils.ColorUtils.getUnusedColor();
    // verify
    expect(unusedColor).toBe("#FFFF00");
  });
});
