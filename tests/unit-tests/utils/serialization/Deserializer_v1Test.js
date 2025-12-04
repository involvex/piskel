describe("Deserializer v1 test", () => {
  const B = "#000000";
  const T = Constants.TRANSPARENT_COLOR;
  const data = {
    modelVersion: 1,
    piskel: {
      height: 2,
      width: 2,
      layers: [
        '{"name":"Layer 1","frames":["[[\\"#000000\\",\\"TRANSPARENT\\"],[\\"TRANSPARENT\\",\\"#000000\\"]]"]}',
      ],
    },
  };

  it("deserializes data serialized for model v0 correctly", (done) => {
    const deserializer = pskl.utils.serialization.Deserializer;
    deserializer.deserialize(data, (p) => {
      // Check the frame has been properly deserialized
      expect(p.getLayerAt(0).getFrames().length).toBe(1);
      const frame = p.getLayerAt(0).getFrameAt(0);
      test.testutils.frameEqualsGrid(frame, [
        [B, T],
        [T, B],
      ]);
      done();
    });
  });
});
