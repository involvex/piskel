describe("PiskelDatabase test", () => {
  // Test object.
  let piskelDatabase;

  const _toSnapshot = function (session_id, name, description, date, serialized) {
    return {
      session_id: session_id,
      name: name,
      description: description,
      date: date,
      serialized: serialized,
    };
  };

  const _checkPiskel = function (actual, expected) {
    expect(actual.name).toBe(expected[0]);
    expect(actual.description).toBe(expected[1]);
    expect(actual.date).toBe(expected[2]);
    expect(actual.serialized).toBe(expected[3]);
  };

  const _addPiskels = function (piskels) {
    var _add = function (index) {
      const piskelData = piskels[index];
      return piskelDatabase.create
        .apply(piskelDatabase, piskelData)
        .then(() => {
          if (piskels[index + 1]) {
            return _add(index + 1);
          } else {
            return Promise.resolve();
          }
        });
    };

    return _add(0);
  };

  beforeEach((done) => {
    // Mock the migration script.
    spyOn(pskl.database.migrate.MigrateLocalStorageToIndexedDb, "migrate");

    // Drop the database before each test.
    const dbName = pskl.database.PiskelDatabase.DB_NAME;
    const req = window.indexedDB.deleteDatabase(dbName);
    req.onsuccess = done;
  });

  afterEach(() => {
    // Close the database if it was still open.
    if (piskelDatabase && piskelDatabase.db) {
      piskelDatabase.db.close();
    }
  });

  it("initializes the DB and returns a promise", (done) => {
    piskelDatabase = new pskl.database.PiskelDatabase();
    piskelDatabase.init().then(done);
  });

  it("can add a piskel and retrieve it", (done) => {
    piskelDatabase = new pskl.database.PiskelDatabase();
    piskelDatabase
      .init()
      .then((db) => {
        return piskelDatabase.create("name", "desc", 0, "serialized");
      })
      .then(() => {
        return piskelDatabase.get("name");
      })
      .then((piskel) => {
        expect(piskel.name).toBe("name");
        expect(piskel.description).toBe("desc");
        expect(piskel.date).toBe(0);
        expect(piskel.serialized).toBe("serialized");
        done();
      });
  });

  it("can delete piskel by name", (done) => {
    const piskels = [
      ["n1", "d1", 10, "s1"],
      ["n2", "d2", 20, "s2"],
      ["n3", "d3", 30, "s3"],
    ];

    piskelDatabase = new pskl.database.PiskelDatabase();
    piskelDatabase
      .init()
      .then((db) => {
        return _addPiskels(piskels);
      })
      .then(() => {
        return piskelDatabase.delete("n2");
      })
      .then(() => {
        return piskelDatabase.get("n1");
      })
      .then((piskelData) => {
        _checkPiskel(piskelData, piskels[0]);
        return piskelDatabase.get("n3");
      })
      .then((piskelData) => {
        _checkPiskel(piskelData, piskels[2]);
        return piskelDatabase.get("n2");
      })
      .then((piskelData) => {
        expect(piskelData).toBe(undefined);
        done();
      });
  });

  it("can list piskels", (done) => {
    const piskels = [
      ["n1", "d1", 10, "s1"],
      ["n2", "d2", 20, "s2"],
      ["n3", "d3", 30, "s3"],
    ];

    piskelDatabase = new pskl.database.PiskelDatabase();
    piskelDatabase
      .init()
      .then((db) => {
        return _addPiskels(piskels);
      })
      .then(() => {
        return piskelDatabase.list();
      })
      .then((piskels) => {
        expect(piskels.length).toBe(3);
        piskels.forEach((piskelData) => {
          expect(piskelData.name).toMatch(/n[1-3]/);
          expect(piskelData.description).toMatch(/d[1-3]/);
          expect(piskelData.date).toBeDefined();
          expect(piskelData.serialized).not.toBeDefined();
        });
        done();
      });
  });

  it("can update piskel with same name", (done) => {
    const piskels = [
      ["n1", "d1", 10, "s1"],
      ["n2", "d2", 20, "s2"],
      ["n3", "d3", 30, "s3"],
    ];

    piskelDatabase = new pskl.database.PiskelDatabase();
    piskelDatabase
      .init()
      .then((db) => {
        return _addPiskels(piskels);
      })
      .then(() => {
        return piskelDatabase.update("n2", "d2_updated", 40, "s2_updated");
      })
      .then((piskels) => {
        return piskelDatabase.list();
      })
      .then((piskels) => {
        expect(piskels.length).toBe(3);
        const p2 = piskels.filter((p) => {
          return p.name === "n2";
        })[0];
        expect(p2.name).toBe("n2");
        expect(p2.description).toBe("d2_updated");
        expect(p2.date).toBe(40);

        return piskelDatabase.get("n2");
      })
      .then((piskel) => {
        _checkPiskel(piskel, ["n2", "d2_updated", 40, "s2_updated"]);
        done();
      });
  });
});
