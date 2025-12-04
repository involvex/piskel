describe("Layer model test", () => {
  beforeEach(() => {});
  afterEach(() => {});

  it("has proper defaults", () => {
    const layer = new pskl.model.Layer("layerName");

    expect(layer.getOpacity()).toBe(1);
    expect(layer.getFrames().length).toBe(0);
    expect(layer.getName()).toBe("layerName");
  });

  it("can set opacity", () => {
    const layer = new pskl.model.Layer("layerName");

    layer.setOpacity(0.5);
    expect(layer.getOpacity()).toBe(0.5);
  });

  it("ignores bad opacity", () => {
    const layer = new pskl.model.Layer("layerName");

    layer.setOpacity(0.3);
    expect(layer.getOpacity()).toBe(0.3);

    layer.setOpacity("Yep I'm an opacity, let me in !");
    expect(layer.getOpacity()).toBe(0.3);

    layer.setOpacity(9000);
    expect(layer.getOpacity()).toBe(0.3);

    layer.setOpacity(-1);
    expect(layer.getOpacity()).toBe(0.3);

    layer.setOpacity(null);
    expect(layer.getOpacity()).toBe(0.3);
  });
});
