(function () {
  const ns = $.namespace('pskl.service');

  ns.FileDropperService = function (piskelController) {
    this.piskelController = piskelController;
    this.dropPosition_ = null;
  };

  ns.FileDropperService.prototype.init = function () {
    document.body.addEventListener('drop', this.onFileDrop.bind(this), false);
    document.body.addEventListener(
      'dragover',
      this.onFileDragOver.bind(this),
      false);

    // Handle Electron file drops
    if (window.electronAPI) {
      window.electronAPI.onFileDropped = this.handleElectronFileDrop.bind(this);
    }
  };

  ns.FileDropperService.prototype.onFileDragOver = function (event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  ns.FileDropperService.prototype.onFileDrop = function (event) {
    event.preventDefault();
    event.stopPropagation();

    this.dropPosition_ = {
      x: event.clientX,
      y: event.clientY
    };

    const files = event.dataTransfer.files;
    this.isMultipleFiles_ = files.length > 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.indexOf('image') === 0;
      const isPiskel = /\.piskel$/i.test(file.name);
      const isPalette = /\.(gpl|txt|pal)$/i.test(file.name);
      if (isImage) {
        pskl.utils.FileUtils.readImageFile(
          file,
          (image) => {
            this.onImageLoaded_(image, file);
          });
      } else if (isPiskel) {
        pskl.utils.PiskelFileUtils.loadFromFile(
          file,
          this.onPiskelFileLoaded_,
          this.onPiskelFileError_);
      } else if (isPalette) {
        pskl.app.paletteImportService.read(
          file,
          this.onPaletteLoaded_.bind(this));
      }
    }
  };

  ns.FileDropperService.prototype.onPaletteLoaded_ = function (palette) {
    pskl.app.paletteService.savePalette(palette);
    pskl.UserSettings.set(pskl.UserSettings.SELECTED_PALETTE, palette.id);
  };

  ns.FileDropperService.prototype.onPiskelFileLoaded_ = function (piskel) {
    if (window.confirm(Constants.CONFIRM_OVERWRITE)) {
      pskl.app.piskelController.setPiskel(piskel);
    }
  };

  ns.FileDropperService.prototype.onPiskelFileError_ = function (reason) {
    $.publish(Events.PISKEL_FILE_IMPORT_FAILED, [reason]);
  };

  ns.FileDropperService.prototype.handleElectronFileDrop = function (filePath) {
    // Handle file drops from Electron main process
    if (window.electronAPI && window.electronAPI.fs) {
      window.electronAPI.fs.readFile(filePath, 'base64').then(result => {
        if (result.success) {
          const extension = filePath.split('.').pop().toLowerCase();
          const fileName = filePath.split('\\').pop() || filePath.split('/').pop();

          if (extension === 'piskel') {
            // Handle .piskel files
            this.handlePiskelFile(result.data, fileName);
          } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension)) {
            // Handle image files
            this.handleImageFile(result.data, fileName);
          } else if (['gpl', 'txt', 'pal'].includes(extension)) {
            // Handle palette files
            this.handlePaletteFile(result.data, fileName);
          }
        }
      }).catch(error => {
        console.error('Error reading file:', error);
      });
    }
  };

  ns.FileDropperService.prototype.handleImageFile = function (base64Data, fileName) {
    const img = new Image();
    img.onload = () => {
      this.dropPosition_ = { x: 0, y: 0 }; // Default position for Electron drops
      this.onImageLoaded_(img, { name: fileName });
    };
    img.src = 'data:image/png;base64,' + base64Data;
  };

  ns.FileDropperService.prototype.handlePiskelFile = function (data, fileName) {
    try {
      const piskelData = JSON.parse(atob(data));
      const piskel = pskl.utils.PiskelFileUtils.createFromPiskelData(piskelData);
      this.onPiskelFileLoaded_(piskel);
    } catch (error) {
      console.error('Error parsing .piskel file:', error);
      this.onPiskelFileError_(error.message);
    }
  };

  ns.FileDropperService.prototype.handlePaletteFile = function (data, fileName) {
    // Create a mock file object for palette processing
    const mockFile = new Blob([data], { type: 'text/plain' });
    mockFile.name = fileName;

    pskl.app.paletteImportService.read(
      mockFile,
      this.onPaletteLoaded_.bind(this)
    );
  };

  ns.FileDropperService.prototype.onImageLoaded_ = function (
    importedImage,
    file
  ) {
    const piskelWidth = pskl.app.piskelController.getWidth();
    const piskelHeight = pskl.app.piskelController.getHeight();

    if (this.isMultipleFiles_) {
      this.piskelController.addFrameAtCurrentIndex();
      this.piskelController.selectNextFrame();
    } else if (
      importedImage.width > piskelWidth ||
      importedImage.height > piskelHeight
    ) {
      // For single file imports, if the file is too big, trigger the import wizard.
      $.publish(Events.DIALOG_SHOW, {
        dialogId: 'import',
        initArgs: {
          rawFiles: [file]
        }
      });

      return;
    }

    const currentFrame = this.piskelController.getCurrentFrame();
    // Convert client coordinates to sprite coordinates
    const spriteDropPosition = pskl.app.drawingController.getSpriteCoordinates(
      this.dropPosition_.x,
      this.dropPosition_.y);
    const x = spriteDropPosition.x;
    const y = spriteDropPosition.y;

    pskl.utils.FrameUtils.addImageToFrame(currentFrame, importedImage, x, y);

    $.publish(Events.PISKEL_RESET);
    $.publish(Events.PISKEL_SAVE_STATE, {
      type: pskl.service.HistoryService.SNAPSHOT
    });
  };
})();
