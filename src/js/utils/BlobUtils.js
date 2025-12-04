(function () {
  const ns = $.namespace('pskl.utils');

  const BASE64_REGEX = /\s*;\s*base64\s*(?:;|$)/i;

  ns.BlobUtils = {
    dataToBlob: function (dataURI, type, callback) {
      const headerEnd = dataURI.indexOf(',');
      const data = dataURI.substring(headerEnd + 1);
      const isBase64 = BASE64_REGEX.test(dataURI.substring(0, headerEnd));
      let blob;

      if (Blob.fake) {
        // no reason to decode a data: URI that's just going to become a data URI again
        blob = new Blob();
        blob.encoding = isBase64 ? 'base64' : 'URI';
        blob.data = data;
        blob.size = data.length;
      } else if (Uint8Array) {
        const blobData = isBase64 ?
          pskl.utils.Base64.decode(data) :
          decodeURIComponent(data);
        blob = new Blob([blobData], { type: type });
      }
      callback(blob);
    },

    canvasToBlob: function (canvas, callback, type /*, ...args*/) {
      type = type || 'image/png';

      if (canvas.mozGetAsFile) {
        callback(canvas.mozGetAsFile('canvas', type));
      } else {
        const args = Array.prototype.slice.call(arguments, 2);
        const dataURI = canvas.toDataURL.apply(canvas, args);
        pskl.utils.BlobUtils.dataToBlob(dataURI, type, callback);
      }
    },

    stringToBlob: function (string, callback, type) {
      type = type || 'text/plain';
      pskl.utils.BlobUtils.dataToBlob(
        'data:' + type + ',' + string,
        type,
        callback
      );
    }
  };
})();
