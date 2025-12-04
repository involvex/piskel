describe("Deserializer v0 test", () => {
  const black = "#000000";
  const transparent = Constants.TRANSPARENT_COLOR;
  const data = [
    [
      ["#000000", "TRANSPARENT"],
      ["TRANSPARENT", "#000000"],
    ],
  ];

  it("deserializes data serialized for model v0 correctly", (done) => {
    const deserializer = pskl.utils.serialization.Deserializer;
    deserializer.deserialize(data, (p) => {
      // Check the frame has been properly deserialized
      expect(p.getLayerAt(0).getFrames().length).toBe(1);
      const frame = p.getLayerAt(0).getFrameAt(0);
      test.testutils.frameEqualsGrid(frame, [
        [black, transparent],
        [transparent, black],
      ]);
      done();
    });
  });
});
