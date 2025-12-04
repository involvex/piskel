(function () {
  const ns = $.namespace('pskl.service.storage');

  ns.FileDownloadStorageService = function () {};
  ns.FileDownloadStorageService.prototype.init = function () {};

  ns.FileDownloadStorageService.prototype.save = function (piskel) {
    const serialized = pskl.utils.serialization.Serializer.serialize(piskel);
    const deferred = Q.defer();

    pskl.utils.BlobUtils.stringToBlob(
      serialized,
      (blob) => {
        const piskelName = piskel.getDescriptor().name;
        const timestamp = pskl.utils.DateUtils.format(
          new Date(),
          '{{Y}}{{M}}{{D}}-{{H}}{{m}}{{s}}');
        const fileName = piskelName + '-' + timestamp + '.piskel';

        try {
          pskl.utils.FileUtils.downloadAsFile(blob, fileName);
          deferred.resolve();
        } catch (e) {
          deferred.reject(e.message);
        }
      },
      'application/piskel+json');
    return deferred.promise;
  };
})();
