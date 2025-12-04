describe("Serialization/Deserialization test", () => {
  beforeEach(() => {
    pskl.app.piskelController = {
      getFPS: function () {
        return 1;
      },
    };
  });

  afterEach(() => {
    delete pskl.app.piskelController;
  });

  it("serializes frames correctly", (done) => {
    // Create piskel.
    const descriptor = new pskl.model.piskel.Descriptor(
      "piskelName",
      "piskelDesc"
    );
    const piskel = new pskl.model.Piskel(1, 1, 1, descriptor);
    // Add layer.
    piskel.addLayer(new pskl.model.Layer("layer1"));
    // Add frame.
    piskel.getLayerAt(0).addFrame(
      pskl.model.Frame.fromPixelGrid(
        test.testutils.toFrameGrid([
          ["red", "black"],
          ["blue", "green"],
        ])
      )
    );

    // Verify the frame is successfully added in the layer.
    expect(piskel.getLayerAt(0).getFrames().length).toBe(1);

    const serializedPiskel =
      pskl.utils.serialization.Serializer.serialize(piskel);

    const deserializer = pskl.utils.serialization.Deserializer;
    deserializer.deserialize(JSON.parse(serializedPiskel), (p) => {
      // Check the frame has been properly deserialized
      expect(p.getLayerAt(0).getFrames().length).toBe(1);
      const frame = p.getLayerAt(0).getFrameAt(0);
      test.testutils.frameEqualsGrid(frame, [
        ["red", "black"],
        ["blue", "green"],
      ]);
      done();
    });
  });

  it("serializes layer opacity", (done) => {
    const descriptor = new pskl.model.piskel.Descriptor(
      "piskelName",
      "piskelDesc"
    );
    const piskel = new pskl.model.Piskel(1, 1, 1, descriptor);

    piskel.addLayer(new pskl.model.Layer("layer1"));
    piskel.addLayer(new pskl.model.Layer("layer2"));
    piskel.addLayer(new pskl.model.Layer("layer3"));

    piskel.getLayerAt(0).setOpacity(0);
    piskel.getLayerAt(1).setOpacity(0.3);
    piskel.getLayerAt(2).setOpacity(0.9);

    const frame = new pskl.model.Frame(1, 1);
    piskel.getLayers().forEach((layer) => {
      layer.addFrame(frame);
    });

    const serializedPiskel =
      pskl.utils.serialization.Serializer.serialize(piskel);

    const deserializer = pskl.utils.serialization.Deserializer;
    deserializer.deserialize(JSON.parse(serializedPiskel), (p) => {
      expect(p.getLayerAt(0).getOpacity()).toBe(0);
      expect(p.getLayerAt(1).getOpacity()).toBe(0.3);
      expect(p.getLayerAt(2).getOpacity()).toBe(0.9);

      // Check the serialization was successful
      expect(p.getLayerAt(0).getFrames().length).toBe(1);
      done();
    });
  });
});
