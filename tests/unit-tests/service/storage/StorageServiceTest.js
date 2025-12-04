describe("Storage Service test suite", () => {
  let storageService = null;
  const piskel = {};

  beforeEach(() => {
    pskl.app.galleryStorageService = {
      save: function () {},
    };
    pskl.app.desktopStorageService = {
      save: function () {},
    };
    pskl.app.fileDownloadStorageService = {
      save: function () {},
    };
    pskl.app.localStorageService = {
      save: function () {},
    };
    pskl.app.shortcutService = {
      registerShortcut: function () {},
    };

    storageService = new pskl.service.storage.StorageService();
    storageService.init();
  });

  const checkSubServiceSuccessfulSave = function (service, methodName, done) {
    spyOn(service, "save").and.returnValue(Q.resolve());
    storageService[methodName](piskel)
      .then(
        () => {
          expect(service.save).toHaveBeenCalledWith(piskel, undefined);
        },
        (err) => {
          expect(false).toBe(
            true,
            "Error callback should not have been called"
          );
        }
      )
      .then(() => {
        done();
      });
  };

  const checkSubServiceFailedSave = function (service, methodName, done) {
    spyOn(service, "save").and.returnValue(Q.reject());
    storageService[methodName](piskel)
      .then(
        () => {
          expect(false).toBe(
            true,
            "Success callback should not have been called"
          );
        }
        , () => {
          expect(service.save).toHaveBeenCalledWith(piskel, undefined);
        }
      )
      .then(() => {
        done();
      });
  };

  // GalleryStorage
  it("calls GalleryStorage#save in saveToGallery", (done) => {
    checkSubServiceSuccessfulSave(
      pskl.app.galleryStorageService,
      "saveToGallery",
      done,
    );
  });
  it("calls GalleryStorage#save in saveToGallery - error case", (done) => {
    checkSubServiceFailedSave(
      pskl.app.galleryStorageService,
      "saveToGallery",
      done,
    );
  });

  // DesktopStorage
  it("calls DesktopStorage#save in saveToDesktop", (done) => {
    checkSubServiceSuccessfulSave(
      pskl.app.desktopStorageService,
      "saveToDesktop",
      done,
    );
  });
  it("calls DesktopStorage#save in saveToDesktop - error case", (done) => {
    checkSubServiceFailedSave(
      pskl.app.desktopStorageService,
      "saveToDesktop",
      done,
    );
  });

  // FileDownloadStorage
  it("calls FileDownloadStorage#save in saveToFileDownload", (done) => {
    checkSubServiceSuccessfulSave(
      pskl.app.fileDownloadStorageService,
      "saveToFileDownload",
      done,
    );
  });
  it("calls FileDownloadStorage#save in saveToFileDownload - error case", (done) => {
    checkSubServiceFailedSave(
      pskl.app.fileDownloadStorageService,
      "saveToFileDownload",
      done,
    );
  });

  // LocalStorage
  it("calls LocalStorage#save in saveToLocalStorage", (done) => {
    checkSubServiceSuccessfulSave(
      pskl.app.localStorageService,
      "saveToLocalStorage",
      done,
    );
  });
  it("calls LocalStorage#save in saveToLocalStorage - error case", (done) => {
    checkSubServiceFailedSave(
      pskl.app.localStorageService,
      "saveToLocalStorage",
      done,
    );
  });

  it("updates saving status properly", (done) => {
    const deferred = Q.defer();
    spyOn(pskl.app.galleryStorageService, "save").and.returnValue(
      deferred.promise,
    );

    // check storageService is not in saving mode
    expect(storageService.isSaving()).toBe(false);

    // save
    const storageServicePromise = storageService.saveToGallery(piskel);

    // storageService is now in saving mode
    expect(storageService.isSaving()).toBe(true);

    // we have called save once
    expect(pskl.app.galleryStorageService.save.calls.count()).toBe(1);

    // call save again, should be ignored
    storageService.saveToGallery(piskel);
    expect(pskl.app.galleryStorageService.save.calls.count()).toBe(1);

    deferred.resolve();
    storageServicePromise.then(() => {
      // after saving, isSaving() should be false again
      expect(storageService.isSaving()).toBe(false);
      done();
    });
  });

  it("updates saving status on BEFORE_SAVING_PISKEL and AFTER_SAVING_PISKEL events", () => {
    spyOn(pskl.app.galleryStorageService, "save").and.returnValue(Q.resolve());

    // check storageService is not in saving mode
    expect(storageService.isSaving()).toBe(false);

    // trigger before save event
    $.publish(Events.BEFORE_SAVING_PISKEL);
    expect(storageService.isSaving()).toBe(true);

    // call save, should have been ignored
    storageService.saveToGallery(piskel);
    expect(pskl.app.galleryStorageService.save.calls.count()).toBe(0);

    // trigger before save event
    $.publish(Events.AFTER_SAVING_PISKEL);
    expect(storageService.isSaving()).toBe(false);
  });
});
