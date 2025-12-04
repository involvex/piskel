(function () {
  const ns = $.namespace('pskl.controller.settings.exportimage');

  ns.ZipExportController = function (piskelController, exportController) {
    this.piskelController = piskelController;
    this.exportController = exportController;
  };

  pskl.utils.inherit(
    ns.ZipExportController,
    pskl.controller.settings.AbstractSettingController);
  ns.ZipExportController.prototype.init = function () {
    this.pngFilePrefixInput = document.querySelector('.zip-prefix-name');
    this.pngFilePrefixInput.value = 'sprite_';

    this.splitByLayersCheckbox = document.querySelector(
      '.zip-split-layers-checkbox');
    this.addEventListener(
      this.splitByLayersCheckbox,
      'change',
      this.onSplitLayersClick_);
    this.useLayerNamesContainer = document.querySelector(
      '.use-layer-names-container');
    this.useLayerNamesCheckbox = document.querySelector(
      '.zip-use-layer-names-checkbox');
    this.toggleHideUseLayerNamesCheckbox();

    const zipButton = document.querySelector('.zip-generate-button');
    this.addEventListener(zipButton, 'click', this.onZipButtonClick_);
  };

  ns.ZipExportController.prototype.toggleHideUseLayerNamesCheckbox =
    function () {
      this.useLayerNamesContainer.style.display = this.splitByLayersCheckbox
        .checked ?
        'block' :
        'none';
    };

  ns.ZipExportController.prototype.onSplitLayersClick_ = function () {
    this.toggleHideUseLayerNamesCheckbox();
  };

  ns.ZipExportController.prototype.onZipButtonClick_ = function () {
    const zip = new window.JSZip();

    if (this.splitByLayersCheckbox.checked) {
      this.splittedExport_(zip);
    } else {
      this.mergedExport_(zip);
    }

    const fileName = this.getPiskelName_() + '.zip';

    const blob = zip.generate({
      type: 'blob'
    });

    pskl.utils.FileUtils.downloadAsFile(blob, fileName);
  };

  ns.ZipExportController.prototype.mergedExport_ = function (zip) {
    const paddingLength = ('' + this.piskelController.getFrameCount()).length;
    const zoom = this.exportController.getExportZoom();
    for (let i = 0; i < this.piskelController.getFrameCount(); i++) {
      const render = this.piskelController.renderFrameAt(i, true);
      const canvas = pskl.utils.ImageResizer.scale(render, zoom);
      const basename = this.pngFilePrefixInput.value;
      const id = pskl.utils.StringUtils.leftPad(i, paddingLength, '0');
      const filename = basename + id + '.png';
      zip.file(
        filename,
        pskl.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n',
        { base64: true });
    }
  };

  ns.ZipExportController.prototype.splittedExport_ = function (zip) {
    const layers = this.piskelController.getLayers();
    const framePaddingLength = ('' + this.piskelController.getFrameCount())
      .length;
    const layerPaddingLength = ('' + layers.length).length;
    const zoom = this.exportController.getExportZoom();
    for (let j = 0; this.piskelController.hasLayerAt(j); j++) {
      const layer = this.piskelController.getLayerAt(j);
      const layerid = pskl.utils.StringUtils.leftPad(j, layerPaddingLength, '0');
      for (let i = 0; i < this.piskelController.getFrameCount(); i++) {
        const render = pskl.utils.LayerUtils.renderFrameAt(layer, i, true);
        const canvas = pskl.utils.ImageResizer.scale(render, zoom);
        const basename = this.pngFilePrefixInput.value;
        const frameid = pskl.utils.StringUtils.leftPad(
          i + 1,
          framePaddingLength,
          '0');
        let filename = 'l' + layerid + '_' + basename + frameid + '.png';
        if (this.useLayerNamesCheckbox.checked) {
          filename = layer.getName() + '_' + basename + frameid + '.png';
        }
        zip.file(
          filename,
          pskl.utils.CanvasUtils.getBase64FromCanvas(canvas) + '\n',
          { base64: true });
      }
    }
  };

  ns.ZipExportController.prototype.getPiskelName_ = function () {
    return this.piskelController.getPiskel().getDescriptor().name;
  };
})();
