(function () {
  const ns = $.namespace('pskl.rendering');

  ns.OnionSkinRenderer = function (renderer, piskelController) {
    pskl.rendering.CompositeRenderer.call(this);

    this.piskelController = piskelController;
    this.renderer = renderer;
    this.add(this.renderer);

    this.hash = '';
  };

  ns.OnionSkinRenderer.createInContainer = function (
    container,
    renderingOptions,
    piskelController
  ) {
    // Do not use CachedFrameRenderers here, caching is performed in the render method
    const renderer = new pskl.rendering.frame.FrameRenderer(
      container,
      renderingOptions,
      ['onion-skin-canvas']);
    return new ns.OnionSkinRenderer(renderer, piskelController);
  };

  pskl.utils.inherit(
    pskl.rendering.OnionSkinRenderer,
    pskl.rendering.CompositeRenderer);
  ns.OnionSkinRenderer.prototype.render = function () {
    const frames = this.getOnionFrames_();
    const hash = this.computeHash_(frames);
    if (this.hash != hash) {
      this.hash = hash;
      this.clear();
      if (frames.length > 0) {
        const mergedFrame = pskl.utils.FrameUtils.merge(frames);
        this.renderer.render(mergedFrame);
      }
    }
  };

  ns.OnionSkinRenderer.prototype.getOnionFrames_ = function () {
    const frames = [];

    const currentFrameIndex = this.piskelController.getCurrentFrameIndex();
    const layer = this.piskelController.getCurrentLayer();

    const previousIndex = currentFrameIndex - 1;
    const previousFrame = layer.getFrameAt(previousIndex);
    if (previousFrame) {
      frames.push(previousFrame);
    }

    const nextIndex = currentFrameIndex + 1;
    const nextFrame = layer.getFrameAt(nextIndex);
    if (nextFrame) {
      frames.push(nextFrame);
    }

    return frames;
  };

  ns.OnionSkinRenderer.prototype.computeHash_ = function (frames) {
    const offset = this.getOffset();
    const size = this.getDisplaySize();
    const layers = this.piskelController.getLayers();
    return [
      this.getZoom(),
      this.getGridWidth(),
      offset.x,
      offset.y,
      size.width,
      size.height,
      frames
        .map((f) => {
          return f.getHash();
        })
        .join('-'),
      layers.length
    ].join('-');
  };

  /**
   * See @pskl.rendering.frame.CachedFrameRenderer
   * Same issue : FrameRenderer setDisplaySize destroys the canvas
   * @param {Number} width
   * @param {Number} height
   */
  ns.OnionSkinRenderer.prototype.setDisplaySize = function (width, height) {
    const size = this.getDisplaySize();
    if (size.width !== width || size.height !== height) {
      this.superclass.setDisplaySize.call(this, width, height);
    }
  };

  ns.OnionSkinRenderer.prototype.flush = function () {
    this.hash = '';
  };
})();
