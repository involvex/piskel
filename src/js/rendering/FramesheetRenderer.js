(function () {
  const ns = $.namespace('pskl.rendering');

  /**
   * Render an array of frames
   * @param {Array.<pskl.model.Frame>} frames
   */
  ns.FramesheetRenderer = function (frames) {
    if (frames.length > 0) {
      this.frames = frames;
    } else {
      throw 'FramesheetRenderer : Invalid argument : frames is empty';
    }
  };

  ns.FramesheetRenderer.prototype.renderAsCanvas = function (columns) {
    columns = columns || this.frames.length;
    const rows = Math.ceil(this.frames.length / columns);

    const canvas = this.createCanvas_(columns, rows);

    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i];
      const posX = (i % columns) * frame.getWidth();
      const posY = Math.floor(i / columns) * frame.getHeight();
      this.drawFrameInCanvas_(frame, canvas, posX, posY);
    }
    return canvas;
  };

  ns.FramesheetRenderer.prototype.drawFrameInCanvas_ = function (
    frame,
    canvas,
    offsetWidth,
    offsetHeight
  ) {
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(
      frame.getWidth(),
      frame.getHeight());
    const pixels = frame.getPixels();
    const data = new Uint8ClampedArray(pixels.buffer);
    imageData.data.set(data);
    context.putImageData(imageData, offsetWidth, offsetHeight);
  };

  ns.FramesheetRenderer.prototype.createCanvas_ = function (columns, rows) {
    const sampleFrame = this.frames[0];
    const width = columns * sampleFrame.getWidth();
    const height = rows * sampleFrame.getHeight();
    return pskl.utils.CanvasUtils.createCanvas(width, height);
  };
})();
