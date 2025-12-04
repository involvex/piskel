describe("ShortcutService test suite", () => {
  const A_KEY = "A";
  const B_KEY = "B";
  const A_KEYCODE = 65;
  const B_KEYCODE = 66;

  let service;

  beforeEach(() => {
    service = new pskl.service.keyboard.ShortcutService();
  });

  const createEvent = function (keycode) {
    return {
      which: keycode,
      altKey: false,
      withAltKey: function () {
        this.altKey = true;
        return this;
      },
      ctrlKey: false,
      metaKey: false,
      withCtrlKey: function () {
        this.ctrlKey = true;
        this.metaKey = true;
        return this;
      },
      shiftKey: false,
      withShiftKey: function () {
        this.shiftKey = true;
        return this;
      },
      preventDefaultCalled: false,
      preventDefault: function () {
        this.preventDefaultCalled = true;
      },
      target: {
        nodeName: "div",
      },
      setNodeName: function (nodeName) {
        this.target.nodeName = nodeName;
        return this;
      },
    };
  };

  const setTargetName = function (evt, targetName) {
    evt.target = {
      nodeName: targetName,
    };
  };

  it("accepts only shortcut instances", () => {
    console.log("[ShortcutService] accepts only shortcut instances");

    console.log("[ShortcutService] ... fails for missing shortcut");
    expect(() => {
      service.registerShortcut();
    }).toThrow(
      "Invalid shortcut argument, please use instances of pskl.service.keyboard.Shortcut"
    );

    console.log("[ShortcutService] ... fails for shortcut as empty object");
    expect(() => {
      service.registerShortcut({});
    }).toThrow(
      "Invalid shortcut argument, please use instances of pskl.service.keyboard.Shortcut"
    );

    console.log("[ShortcutService] ... fails for shortcut as a string");
    expect(() => {
      service.registerShortcut("alt+F4");
    }).toThrow(
      "Invalid shortcut argument, please use instances of pskl.service.keyboard.Shortcut"
    );

    const shortcut = new pskl.service.keyboard.Shortcut("shortcut-id", "", A_KEY);

    console.log("[ShortcutService] ... fails for missing callback");
    expect(() => {
      service.registerShortcut(shortcut);
    }).toThrow("Invalid callback argument, please provide a function");

    console.log("[ShortcutService] ... fails for invalid callback");
    expect(() => {
      service.registerShortcut(shortcut, { callback: function () {} });
    }).toThrow("Invalid callback argument, please provide a function");

    console.log("[ShortcutService] ... is ok for valid arguments");
    service.registerShortcut(shortcut, () => {});
  });

  it("triggers shortcut", () => {
    console.log("[ShortcutService] triggers shortcut");
    let callbackCalled = false;

    console.log("[ShortcutService] ... register shortcut for A");
    const shortcutA = new pskl.service.keyboard.Shortcut("shortcut-a", "", A_KEY);
    service.registerShortcut(shortcutA, () => {
      callbackCalled = true;
    });

    console.log("[ShortcutService] ... verify shortcut is called");
    service.onKeyDown_(createEvent(A_KEYCODE));
    expect(callbackCalled).toBe(true);
  });

  it("triggers shortcuts independently", () => {
    console.log("[ShortcutService] registers shortcuts");

    const shortcutA = new pskl.service.keyboard.Shortcut("shortcut-a", "", A_KEY);
    const shortcutB = new pskl.service.keyboard.Shortcut("shortcut-b", "", B_KEY);
    const shortcutA_B = new pskl.service.keyboard.Shortcut("shortcut-a&b", "", [
      A_KEY,
      B_KEY,
    ]);

    const counters = {
      a: 0,
      b: 0,
      a_b: 0,
    };

    console.log(
      "[ShortcutService] ... register separate shortcuts for A and B",
    );
    service.registerShortcut(shortcutA, () => {
      counters.a++;
    });
    service.registerShortcut(shortcutB, () => {
      counters.b++;
    });
    service.registerShortcut(shortcutA_B, () => {
      counters.a_b++;
    });

    console.log(
      "[ShortcutService] ... trigger A, expect counter A at 1, B at 0, A_B at 1",
    );
    service.onKeyDown_(createEvent(A_KEYCODE));
    expect(counters.a).toBe(1);
    expect(counters.b).toBe(0);
    expect(counters.a_b).toBe(1);

    console.log(
      "[ShortcutService] ... trigger A, expect counter A at 1, B at 1, A_B at 2",
    );
    service.onKeyDown_(createEvent(B_KEYCODE));
    expect(counters.a).toBe(1);
    expect(counters.b).toBe(1);
    expect(counters.a_b).toBe(2);
  });

  it("unregisters shortcut", () => {
    console.log("[ShortcutService] unregisters shortcut");
    let callbackCalled = false;

    console.log("[ShortcutService] ... register shortcut for A");
    const shortcutA = new pskl.service.keyboard.Shortcut("shortcut-a", "", A_KEY);
    service.registerShortcut(shortcutA, () => {
      callbackCalled = true;
    });

    console.log("[ShortcutService] ... unregister shortcut A");
    service.unregisterShortcut(shortcutA);

    console.log("[ShortcutService] ... verify shortcut callback is not called");
    service.onKeyDown_(createEvent(A_KEYCODE));
    expect(callbackCalled).toBe(false);
  });

  it("unregisters shortcut without removing other shortcuts", () => {
    console.log("[ShortcutService] unregisters shortcut");
    let callbackCalled = false;

    console.log("[ShortcutService] ... register shortcut for A & B");
    const shortcutA = new pskl.service.keyboard.Shortcut("shortcut-a", "", A_KEY);
    const shortcutB = new pskl.service.keyboard.Shortcut("shortcut-b", "", B_KEY);
    service.registerShortcut(shortcutA, () => {});
    service.registerShortcut(shortcutB, () => {
      callbackCalled = true;
    });

    console.log("[ShortcutService] ... unregister shortcut A");
    service.unregisterShortcut(shortcutA);

    console.log(
      "[ShortcutService] ... verify shortcut callback for B can still be called",
    );
    service.onKeyDown_(createEvent(B_KEYCODE));
    expect(callbackCalled).toBe(true);
  });

  it("supports unregistering unknown shortcuts", () => {
    console.log("[ShortcutService] unregisters shortcut");
    let callbackCalled = false;

    console.log("[ShortcutService] ... register shortcut for A");
    const shortcutA = new pskl.service.keyboard.Shortcut("shortcut-a", "", A_KEY);
    service.registerShortcut(shortcutA, () => {
      callbackCalled = true;
    });

    console.log(
      "[ShortcutService] ... unregister shortcut B, which was not registered in the first place",
    );
    const shortcutB = new pskl.service.keyboard.Shortcut("shortcut-b", "", B_KEY);
    service.unregisterShortcut(shortcutB);

    console.log(
      "[ShortcutService] ... verify shortcut callback for A can still be called",
    );
    callbackCalled = false;
    service.onKeyDown_(createEvent(A_KEYCODE));
    expect(callbackCalled).toBe(true);
  });

  it("does not trigger shortcuts from INPUT or TEXTAREA", () => {
    console.log("[ShortcutService] triggers shortcut");
    let callbackCalled = false;

    console.log("[ShortcutService] ... register shortcut for A");
    const shortcutA = new pskl.service.keyboard.Shortcut("shortcut-a", "", A_KEY);
    service.registerShortcut(shortcutA, () => {
      callbackCalled = true;
    });

    console.log(
      "[ShortcutService] ... verify shortcut is not called from event on INPUT",
    );
    service.onKeyDown_(createEvent(A_KEYCODE).setNodeName("INPUT"));
    expect(callbackCalled).toBe(false);

    console.log(
      "[ShortcutService] ... verify shortcut is not called from event on TEXTAREA",
    );
    service.onKeyDown_(createEvent(A_KEYCODE).setNodeName("TEXTAREA"));
    expect(callbackCalled).toBe(false);

    console.log(
      "[ShortcutService] ... verify shortcut is called from event on LINK",
    );
    service.onKeyDown_(createEvent(A_KEYCODE).setNodeName("A"));
    expect(callbackCalled).toBe(true);
  });

  it("supports meta modifiers", () => {
    console.log("[ShortcutService] triggers shortcut");
    const callbackCalled = false;

    console.log(
      "[ShortcutService] ... create various A shortcuts with modifiers",
    );
    const shortcuts = [
      new pskl.service.keyboard.Shortcut("a", "", A_KEY),
      new pskl.service.keyboard.Shortcut("a_ctrl", "", "ctrl+" + A_KEY),
      new pskl.service.keyboard.Shortcut(
        "a_ctrl_shift",
        "",
        "ctrl+shift+" + A_KEY,
      ),
      new pskl.service.keyboard.Shortcut(
        "a_ctrl_shift_alt",
        "",
        "ctrl+shift+alt+" + A_KEY,
      ),
      new pskl.service.keyboard.Shortcut("a_alt", "", "alt+" + A_KEY),
    ];

    const counters = {
      a: 0,
      a_ctrl: 0,
      a_ctrl_shift: 0,
      a_ctrl_shift_alt: 0,
      a_alt: 0,
    };

    shortcuts.forEach((shortcut) => {
      service.registerShortcut(shortcut, () => {
        counters[shortcut.getId()]++;
      });
    });

    const verifyCounters = function (a, a_c, a_cs, a_csa, a_a) {
      expect(counters.a).toBe(a);
      expect(counters.a_ctrl).toBe(a_c);
      expect(counters.a_ctrl_shift).toBe(a_cs);
      expect(counters.a_ctrl_shift_alt).toBe(a_csa);
      expect(counters.a_alt).toBe(a_a);
    };

    console.log(
      "[ShortcutService] ... trigger A, expect counters CTRL+A, CTRL+SHIFT+A, CTRL+SHIFT+ALT+A, ALT+A to remain at 0",
    );
    service.onKeyDown_(createEvent(A_KEYCODE));
    verifyCounters(1, 0, 0, 0, 0);

    console.log(
      "[ShortcutService] ... trigger CTRL+A, expect counters CTRL+SHIFT+A, CTRL+SHIFT+ALT+A, ALT+A to remain at 0",
    );
    service.onKeyDown_(createEvent(A_KEYCODE).withCtrlKey());
    verifyCounters(1, 1, 0, 0, 0);

    console.log(
      "[ShortcutService] ... trigger CTRL+A, expect counters CTRL+SHIFT+ALT+A, ALT+A to remain at 0",
    );
    service.onKeyDown_(createEvent(A_KEYCODE).withCtrlKey().withShiftKey());
    verifyCounters(1, 1, 1, 0, 0);

    console.log(
      "[ShortcutService] ... trigger CTRL+A, expect counter ALT+A to remain at 0",
    );
    service.onKeyDown_(
      createEvent(A_KEYCODE).withCtrlKey().withShiftKey().withAltKey(),
    );
    verifyCounters(1, 1, 1, 1, 0);

    console.log(
      "[ShortcutService] ... trigger CTRL+A, expect all counters at 1",
    );
    service.onKeyDown_(createEvent(A_KEYCODE).withAltKey());
    verifyCounters(1, 1, 1, 1, 1);
  });
});
