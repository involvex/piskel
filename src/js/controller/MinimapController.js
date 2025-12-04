(function () {
  const ns = $.namespace('pskl.controller');

  ns.MinimapController = function (
    piskelController,
    previewController,
    drawingController,
    container
  ) {
    this.piskelController = piskelController;
    this.previewController = previewController;
    this.drawingController = drawingController;
    this.container = container;

    this.isClicked = false;
    this.isVisible = false;
  };

  ns.MinimapController.prototype.init = function () {
    // Create minimap DOM elements
    this.minimapEl = document.createElement('DIV');
    this.minimapEl.className = 'minimap-crop-frame';
    this.minimapEl.style.display = 'none';
    this.container.appendChild(this.minimapEl);

    // Init mouse events
    this.container.addEventListener(
      'mousedown',
      this.onMinimapMousedown_.bind(this));
    document.body.addEventListener(
      'mousemove',
      this.onMinimapMousemove_.bind(this));
    document.body.addEventListener(
      'mouseup',
      this.onMinimapMouseup_.bind(this));
    $.subscribe(Events.ZOOM_CHANGED, this.renderMinimap_.bind(this));
  };

  ns.MinimapController.prototype.renderMinimap_ = function () {
    const verticalRatio = this.getVerticalRatio_();
    const horizontalRatio = this.getHorizontalRatio_();
    if (verticalRatio > 1 || horizontalRatio > 1) {
      this.displayMinimap_();
    } else {
      this.hideMinimap_();
    }
  };

  ns.MinimapController.prototype.displayMinimap_ = function () {
    const minimapSize = this.getMinimapSize_();
    const previewSize = this.getPreviewSize_();

    const containerRect = this.container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const containerWidth = containerRect.width;

    // offset(x, y) in frame pixels
    const offset = this.drawingController.getRenderer().getOffset();

    // the preview is centered in a square container
    // if the sprite is not a square, a margin is needed on the appropriate coordinate
    // before adding the offset coming from the drawing area
    const leftMargin =
      (containerWidth - Math.max(minimapSize.width, previewSize.width)) / 2;
    const leftOffset = offset.x * this.previewController.getZoom();
    const left = leftMargin + leftOffset;

    const topMargin =
      (containerHeight - Math.max(minimapSize.height, previewSize.height)) / 2;
    const topOffset = offset.y * this.previewController.getZoom();
    const top = topMargin + topOffset;

    this.minimapEl.style.display = 'block';
    this.minimapEl.style.width =
      Math.min(minimapSize.width, containerWidth) + 'px';
    this.minimapEl.style.height =
      Math.min(minimapSize.height, containerHeight) + 'px';
    this.minimapEl.style.left =
      Math.max(0, left) + Constants.RIGHT_COLUMN_PADDING_LEFT + 'px';
    this.minimapEl.style.top = Math.max(0, top) + 'px';

    this.isVisible = true;
  };

  ns.MinimapController.prototype.getMinimapSize_ = function () {
    // Calculate the ratio to translate drawing area sizes to animated preview sizes
    const drawingAreaZoom = this.drawingController.getRenderer().getZoom();
    const animatedPreviewZoom = this.previewController.getZoom();
    const ratio = drawingAreaZoom / animatedPreviewZoom;

    const displaySize = this.drawingController.getRenderer().getDisplaySize();
    const minimapWidth = displaySize.width / ratio;
    const minimapHeight = displaySize.height / ratio;

    return {
      width: minimapWidth,
      height: minimapHeight
    };
  };

  ns.MinimapController.prototype.getPreviewSize_ = function () {
    const frame = this.piskelController.getCurrentFrame();
    const previewWidth = frame.getWidth() * this.previewController.getZoom();
    const previewHeight = frame.getHeight() * this.previewController.getZoom();

    return {
      width: previewWidth,
      height: previewHeight
    };
  };

  ns.MinimapController.prototype.hideMinimap_ = function () {
    this.minimapEl.style.display = 'none';
    this.isVisible = false;
  };

  ns.MinimapController.prototype.onMinimapMousemove_ = function (evt) {
    if (this.isVisible && this.isClicked) {
      const coords = this.getCoordinatesCenteredAround_(evt.clientX, evt.clientY);
      this.drawingController.setOffset(coords.x, coords.y);
    }
  };

  ns.MinimapController.prototype.onMinimapMousedown_ = function (evt) {
    this.isClicked = true;
  };

  ns.MinimapController.prototype.onMinimapMouseup_ = function (evt) {
    this.isClicked = false;
  };

  ns.MinimapController.prototype.getCoordinatesCenteredAround_ = function (
    x,
    y
  ) {
    const frameCoords = this.previewController.getCoordinates(x, y);

    const frameWidth = this.piskelController.getCurrentFrame().getWidth();
    const frameHeight = this.piskelController.getCurrentFrame().getHeight();

    const width = frameWidth / this.getHorizontalRatio_();
    const height = frameHeight / this.getVerticalRatio_();

    return {
      x: frameCoords.x - width / 2,
      y: frameCoords.y - height / 2
    };
  };

  ns.MinimapController.prototype.getVerticalRatio_ = function () {
    const drawingAreaZoom = this.drawingController.getRenderer().getZoom();
    const frame = this.piskelController.getCurrentFrame();
    const frameTotalHeight = frame.getHeight() * drawingAreaZoom;
    const frameDisplayHeight = this.drawingController
      .getRenderer()
      .getDisplaySize().height;

    return frameTotalHeight / frameDisplayHeight;
  };

  ns.MinimapController.prototype.getHorizontalRatio_ = function () {
    const drawingAreaZoom = this.drawingController.getRenderer().getZoom();
    const frame = this.piskelController.getCurrentFrame();
    const frameTotalWidth = frame.getWidth() * drawingAreaZoom;
    const frameDisplayWidth = this.drawingController
      .getRenderer()
      .getDisplaySize().width;

    return frameTotalWidth / frameDisplayWidth;
  };
})();
