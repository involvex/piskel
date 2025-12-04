(function () {
  const ns = $.namespace('pskl.service.storage');

  ns.GalleryStorageService = function (piskelController) {
    this.piskelController = piskelController;
  };

  ns.GalleryStorageService.prototype.init = function () {};

  ns.GalleryStorageService.prototype.save = function (piskel) {
    const descriptor = piskel.getDescriptor();
    const deferred = Q.defer();

    const serialized = pskl.utils.serialization.Serializer.serialize(piskel);

    const data = {
      framesheet: serialized,
      fps: this.piskelController.getFPS(),
      name: descriptor.name,
      description: descriptor.description,
      frames: this.piskelController.getFrameCount(),
      first_frame_as_png: pskl.app.getFirstFrameAsPng(),
      framesheet_as_png: pskl.app.getFramesheetAsPng()
    };

    if (serialized.length > Constants.APPENGINE_SAVE_LIMIT) {
      deferred.reject(
        'This sprite is too big to be saved on the gallery. Try saving it as a .piskel file.');
    }

    if (descriptor.isPublic) {
      data.public = true;
    }

    const successCallback = function (response) {
      deferred.resolve();
    };

    const errorCallback = function (response) {
      deferred.reject(this.getErrorMessage_(response));
    };

    pskl.utils.Xhr.post(
      Constants.APPENGINE_SAVE_URL,
      data,
      successCallback,
      errorCallback.bind(this));
    return deferred.promise;
  };

  ns.GalleryStorageService.prototype.getErrorMessage_ = function (response) {
    let errorMessage = '';
    if (response.status === 401) {
      errorMessage = 'Session expired, please log in again.';
    } else if (response.status === 403) {
      errorMessage =
        'Unauthorized action, this sprite belongs to another account.';
    } else if (response.status === 500) {
      errorMessage =
        'Unexpected server error, please contact us on Github (piskel) or Twitter (@piskelapp)';
    } else {
      errorMessage = 'Unknown error';
    }
    return errorMessage;
  };
})();
