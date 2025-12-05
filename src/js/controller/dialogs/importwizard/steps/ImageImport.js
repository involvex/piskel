(function () {
  const ns = $.namespace('pskl.controller.dialogs.importwizard.steps');

  ns.ImageImport = function (piskelController, importController, container) {
    this.superclass.constructor.apply(this, arguments);
    this.importedImage_ = null;
    this.file_ = null;
  };

  pskl.utils.inherit(ns.ImageImport, ns.AbstractImportStep);

  ns.ImageImport.prototype.init = function (file) {
    this.superclass.init.call(this);

    // This step is only used if rawFiles contains a single image.
    this.file_ = this.mergeData.rawFiles[0];

    this.importPreview = this.container.querySelector(
      '.import-section-preview'
    );

    this.fileNameContainer = this.container.querySelector(
      '.import-image-file-name'
    );

    this.singleImportType = this.container.querySelector(
      '[name=import-type][value=single]'
    );
    this.sheetImportType = this.container.querySelector(
      '[name=import-type][value=sheet]'
    );
    this.resizeWidth = this.container.querySelector('[name=resize-width]');
    this.resizeHeight = this.container.querySelector('[name=resize-height]');
    this.smoothResize = this.container.querySelector(
      '[name=smooth-resize-checkbox]'
    );
    this.frameSizeX = this.container.querySelector('[name=frame-size-x]');
    this.frameSizeY = this.container.querySelector('[name=frame-size-y]');
    this.frameOffsetX = this.container.querySelector('[name=frame-offset-x]');
    this.frameOffsetY = this.container.querySelector('[name=frame-offset-y]');
    this.preserveTransparencyCheckbox = this.container.querySelector(
      '[name=preserve-transparency-checkbox]'
    );
    this.smoothEdgesCheckbox = this.container.querySelector(
      '[name=smooth-edges-checkbox]'
    );

    this.addEventListener(
      this.singleImportType,
      'change',
      this.onImportTypeChange_
    );
    this.addEventListener(
      this.sheetImportType,
      'change',
      this.onImportTypeChange_
    );
    this.addEventListener(this.resizeWidth, 'keyup', this.onResizeInputKeyUp_);
    this.addEventListener(this.resizeHeight, 'keyup', this.onResizeInputKeyUp_);
    this.addEventListener(this.frameSizeX, 'keyup', this.onFrameInputKeyUp_);
    this.addEventListener(this.frameSizeY, 'keyup', this.onFrameInputKeyUp_);
    this.addEventListener(this.frameOffsetX, 'keyup', this.onFrameInputKeyUp_);
    this.addEventListener(this.frameOffsetY, 'keyup', this.onFrameInputKeyUp_);

    // Check if this is a Playdate imagetable filename
    this.checkPlaydateImagetable_();

    pskl.utils.FileUtils.readImageFile(
      this.file_,
      this.onImageLoaded_.bind(this)
    );
    if (this.piskelController.isEmpty()) {
      this.nextButton.textContent = 'import';
    }
  };

  ns.ImageImport.prototype.onNextClick = function () {
    this.container.classList.add('import-image-loading');
    this.createPiskelFromImage()
      .then(
        (piskel) => {
          this.mergeData.mergePiskel = piskel;
          this.container.classList.remove('import-image-loading');
          this.superclass.onNextClick.call(this);
        }
      )
      .catch((e) => {
        console.error(e);
      });
  };

  ns.ImageImport.prototype.onShow = function () {
    this.container.classList.remove('import-image-loading');
  };

  ns.ImageImport.prototype.createPiskelFromImage = function () {
    let name = this.extractFileNameFromPath_(this.file_.name);
    // Remove extension from filename.
    name = name.replace(/\.[a-zA-Z]+$/, '');

    const deferred = Q.defer();
    pskl.app.importService.newPiskelFromImage(
      this.importedImage_,
      {
        importType: this.getImportType_(),
        frameSizeX:
          this.getImportType_() === 'single' ?
            this.resizeWidth.value :
            this.sanitizeInputValue_(this.frameSizeX, 1),
        frameSizeY:
          this.getImportType_() === 'single' ?
            this.resizeHeight.value :
            this.sanitizeInputValue_(this.frameSizeY, 1),
        frameOffsetX: this.sanitizeInputValue_(this.frameOffsetX, 0),
        frameOffsetY: this.sanitizeInputValue_(this.frameOffsetY, 0),
        smoothing: !!this.smoothResize.checked,
        preserveOpacity: !!this.preserveTransparencyCheckbox.checked,
        preserveSmoothEdges: !!this.smoothEdgesCheckbox.checked,
        name: name,
      },
      deferred.resolve
    );
    return deferred.promise;
  };

  ns.ImageImport.prototype.onImportTypeChange_ = function (evt) {
    if (this.getImportType_() === 'single') {
      // Using single image, so remove the frame grid
      this.hideFrameGrid_();
    } else {
      // Using spritesheet import, so draw the frame grid in the preview
      const x = this.sanitizeInputValue_(this.frameOffsetX, 0);
      const y = this.sanitizeInputValue_(this.frameOffsetY, 0);
      const w = this.sanitizeInputValue_(this.frameSizeX, 1);
      const h = this.sanitizeInputValue_(this.frameSizeY, 1);
      this.drawFrameGrid_(x, y, w, h);
    }
  };

  ns.ImageImport.prototype.onResizeInputKeyUp_ = function (evt) {
    const from = evt.target.getAttribute('name');
    if (this.importedImage_) {
      this.synchronizeResizeFields_(evt.target.value, from);
    }
  };

  ns.ImageImport.prototype.onFrameInputKeyUp_ = function (evt) {
    if (this.importedImage_) {
      this.synchronizeFrameFields_(evt.target.value);
    }
  };

  ns.ImageImport.prototype.synchronizeResizeFields_ = function (value, from) {
    value = parseInt(value, 10);
    if (isNaN(value)) {
      value = 0;
    }
    const height = this.importedImage_.height;
    const width = this.importedImage_.width;

    // Select single image import type since the user changed a value here
    this.singleImportType.checked = true;

    if (from === 'resize-width') {
      this.resizeHeight.value = Math.round((value * height) / width);
    } else {
      this.resizeWidth.value = Math.round((value * width) / height);
    }
  };

  ns.ImageImport.prototype.synchronizeFrameFields_ = function (value) {
    value = parseInt(value, 10);
    if (isNaN(value)) {
      value = 0;
    }

    // Parse the frame input values
    const frameSizeX = this.sanitizeInputValue_(this.frameSizeX, 1);
    const frameSizeY = this.sanitizeInputValue_(this.frameSizeY, 1);
    const frameOffsetX = this.sanitizeInputValue_(this.frameOffsetX, 0);
    const frameOffsetY = this.sanitizeInputValue_(this.frameOffsetY, 0);

    // Select spritesheet import type since the user changed a value here
    this.sheetImportType.checked = true;

    // Draw the grid
    this.drawFrameGrid_(frameOffsetX, frameOffsetY, frameSizeX, frameSizeY);
  };

  ns.ImageImport.prototype.sanitizeInputValue_ = function (input, minValue) {
    let value = parseInt(input.value, 10);
    if (value <= minValue || isNaN(value)) {
      input.value = minValue;
      value = minValue;
    }
    return value;
  };

  ns.ImageImport.prototype.getImportType_ = function () {
    if (this.singleImportType.checked) {
      return this.singleImportType.value;
    } else if (this.sheetImportType.checked) {
      return this.sheetImportType.value;
    } else {
      throw 'Could not find the currently selected import type';
    }
  };

  ns.ImageImport.prototype.onImageLoaded_ = function (image) {
    this.importedImage_ = image;

    const w = this.importedImage_.width;
    const h = this.importedImage_.height;

    // FIXME : We remove the onload callback here because JsGif will insert
    // the image again and we want to avoid retriggering the image onload
    this.importedImage_.onload = function () {};

    const fileName = this.extractFileNameFromPath_(this.file_.name);
    this.fileNameContainer.textContent = fileName;
    this.fileNameContainer.setAttribute('title', fileName);

    // Apply Playdate frame size if detected
    this.applyPlaydateFrameSize_(w, h);

    this.resizeWidth.value = w;
    this.resizeHeight.value = h;

    this.frameSizeX.value = w;
    this.frameSizeY.value = h;
    this.frameOffsetX.value = 0;
    this.frameOffsetY.value = 0;

    this.importPreview.innerHTML = '';
    this.importPreview.appendChild(this.createImagePreview_());
  };

  ns.ImageImport.prototype.checkPlaydateImagetable_ = function () {
    if (!this.file_ || !this.file_.name) {
      return;
    }

    const filename = this.file_.name;
    
    // Check if PlaydateUtils is available
    if (!pskl.utils.PlaydateUtils || !pskl.utils.PlaydateUtils.parseImagetableFilename) {
      console.warn('PlaydateUtils not available, skipping imagetable detection');
      return;
    }

    const playdateInfo =
      pskl.utils.PlaydateUtils.parseImagetableFilename(filename);

    if (playdateInfo) {
      this.playdateFrameSize_ = {
        width: playdateInfo.frameWidth,
        height: playdateInfo.frameHeight
      };
      this.playdateFrameCount_ = playdateInfo.frames;
      console.log('Playdate imagetable detected:', playdateInfo);
    }
  };

  ns.ImageImport.prototype.applyPlaydateFrameSize_ = function (
    defaultWidth,
    defaultHeight
  ) {
    if (this.playdateFrameSize_) {
      // Use Playdate frame size if available
      this.frameSizeX.value = this.playdateFrameSize_.width;
      this.frameSizeY.value = this.playdateFrameSize_.height;

      // Auto-select spritesheet import type for Playdate imagetables
      this.sheetImportType.checked = true;

      console.log('Applied Playdate frame size:', this.playdateFrameSize_);
    }
  };

  ns.ImageImport.prototype.createImagePreview_ = function () {
    const image = document.createElement('IMG');
    image.src = this.importedImage_.src;
    return image;
  };

  ns.ImageImport.prototype.extractFileNameFromPath_ = function (path) {
    let parts = [];
    if (path.indexOf('/') !== -1) {
      parts = path.split('/');
    } else if (path.indexOf('\\') !== -1) {
      parts = path.split('\\');
    } else {
      parts = [path];
    }
    return parts[parts.length - 1];
  };

  ns.ImageImport.prototype.drawFrameGrid_ = function (
    frameX,
    frameY,
    frameW,
    frameH
  ) {
    if (!this.importedImage_) {
      return;
    }

    // Grab the sizes of the source and preview images
    const width = this.importedImage_.width;
    const height = this.importedImage_.height;

    const image = this.importPreview.querySelector('img');
    const previewWidth = image.offsetWidth;
    const previewHeight = image.offsetHeight;

    let canvas = this.importPreview.querySelector('canvas');
    if (!canvas) {
      // Create a new canvas for the grid
      canvas = pskl.utils.CanvasUtils.createCanvas(
        previewWidth + 1,
        previewHeight + 1
      );
      this.importPreview.appendChild(canvas);
    }

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    // Calculate the number of whole frames
    const countX = Math.floor((width - frameX) / frameW);
    const countY = Math.floor((height - frameY) / frameH);

    if (countX > 0 && countY > 0) {
      const scaleX = previewWidth / width;
      const scaleY = previewHeight / height;
      const maxWidth = countX * frameW + frameX;
      const maxHeight = countY * frameH + frameY;

      // Draw the vertical lines
      for (
        let x = frameX + 0.5;
        x < maxWidth + 1 && x < width + 1;
        x += frameW
      ) {
        context.moveTo(x * scaleX, frameY * scaleY);
        context.lineTo(x * scaleX, maxHeight * scaleY);
      }

      // Draw the horizontal lines
      for (
        let y = frameY + 0.5;
        y < maxHeight + 1 && y < height + 1;
        y += frameH
      ) {
        context.moveTo(frameX * scaleX, y * scaleY);
        context.lineTo(maxWidth * scaleX, y * scaleY);
      }

      context.lineWidth = 1;
      context.strokeStyle = 'gold';
      context.stroke();

      // Show the canvas
      canvas.style.display = 'block';
    } else {
      this.hideFrameGrid_();
    }
  };

  ns.ImageImport.prototype.hideFrameGrid_ = function () {
    const canvas = this.importPreview.querySelector('canvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
  };
})();
