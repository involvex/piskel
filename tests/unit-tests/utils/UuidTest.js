describe("UUID Generator", () => {
  beforeEach(() => {});
  afterEach(() => {});

  it("returns valid uuids", () => {
    // when

    // then
    const uuid1 = pskl.utils.Uuid.generate();
    const uuid2 = pskl.utils.Uuid.generate();

    // verify
    expect(typeof uuid1).toBe("string");
    expect(uuid1.length).toBe(36);
    const splits = uuid1.split("-");
    expect(splits.length).toBe(5);

    expect(splits[0].length).toBe(8);
    expect(splits[1].length).toBe(4);
    expect(splits[2].length).toBe(4);
    expect(splits[3].length).toBe(4);
    expect(splits[4].length).toBe(12);

    expect(uuid1).not.toBe(uuid2);
  });
});
