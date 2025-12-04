(function () {
  const ns = $.namespace('pskl.controller.settings.exportimage');

  const BLACK = '#000000';

  ns.MiscExportController = function (piskelController) {
    this.piskelController = piskelController;
  };

  pskl.utils.inherit(
    ns.MiscExportController,
    pskl.controller.settings.AbstractSettingController);
  ns.MiscExportController.prototype.init = function () {
    const cDownloadButton = document.querySelector('.c-download-button');
    this.addEventListener(cDownloadButton, 'click', this.onDownloadCFileClick_);
  };

  ns.MiscExportController.prototype.onDownloadCFileClick_ = function (evt) {
    const fileName = this.getPiskelName_() + '.c';
    const cName = this.getPiskelName_().replace(' ', '_');
    const width = this.piskelController.getWidth();
    const height = this.piskelController.getHeight();
    const frameCount = this.piskelController.getFrameCount();

    // Useful defines for C routines
    let frameStr = '#include <stdint.h>\n\n';
    frameStr +=
      '#define ' +
      cName.toUpperCase() +
      '_FRAME_COUNT ' +
      this.piskelController.getFrameCount() +
      '\n';
    frameStr +=
      '#define ' + cName.toUpperCase() + '_FRAME_WIDTH ' + width + '\n';
    frameStr +=
      '#define ' + cName.toUpperCase() + '_FRAME_HEIGHT ' + height + '\n\n';

    frameStr += '/* Piskel data for \"' + this.getPiskelName_() + '\" */\n\n';

    frameStr += 'static const uint32_t ' + cName.toLowerCase();
    frameStr += '_data[' + frameCount + '][' + width * height + '] = {\n';

    for (let i = 0; i < frameCount; i++) {
      const render = this.piskelController.renderFrameAt(i, true);
      const context = render.getContext('2d');
      const imgd = context.getImageData(0, 0, width, height);
      const pix = imgd.data;

      frameStr += '{\n';
      for (let j = 0; j < pix.length; j += 4) {
        frameStr += this.rgbToCHex(pix[j], pix[j + 1], pix[j + 2], pix[j + 3]);
        if (j != pix.length - 4) {
          frameStr += ', ';
        }
        if ((j + 4) % (width * 4) === 0) {
          frameStr += '\n';
        }
      }
      if (i != frameCount - 1) {
        frameStr += '},\n';
      } else {
        frameStr += '}\n';
      }
    }

    frameStr += '};\n';
    pskl.utils.BlobUtils.stringToBlob(
      frameStr,
      (blob) => {
        pskl.utils.FileUtils.downloadAsFile(blob, fileName);
      },
      'application/text');
  };

  ns.MiscExportController.prototype.getPiskelName_ = function () {
    return this.piskelController.getPiskel().getDescriptor().name;
  };

  ns.MiscExportController.prototype.rgbToCHex = function (r, g, b, a) {
    let hexStr = '0x';
    hexStr += ('00' + a.toString(16)).substr(-2);
    hexStr += ('00' + b.toString(16)).substr(-2);
    hexStr += ('00' + g.toString(16)).substr(-2);
    hexStr += ('00' + r.toString(16)).substr(-2);
    return hexStr;
  };
})();
