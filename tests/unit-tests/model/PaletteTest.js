describe("Palette", () => {
  beforeEach(() => {});
  afterEach(() => {});

  it("moves colors correctly", () => {
    // when
    const colors = ["#000000", "#111111", "#222222"];
    const palette = new pskl.model.Palette("id", "name", colors);

    // then
    palette.move(2, 0);

    // verify
    expect(palette.get(0)).toBe("#222222");
    expect(palette.get(1)).toBe("#000000");
    expect(palette.get(2)).toBe("#111111");
  });
});
