(function () {
  const ns = $.namespace('pskl.rendering');

  ns.PiskelRenderer = function (piskelController) {
    const frames = [];
    for (let i = 0; i < piskelController.getFrameCount(); i++) {
      frames.push(piskelController.renderFrameAt(i, true));
    }
    this.piskelController = piskelController;
    this.frames = frames;
  };

  ns.PiskelRenderer.prototype.renderAsCanvas = function (columns) {
    columns = columns || this.frames.length;
    const rows = Math.ceil(this.frames.length / columns);

    const canvas = this.createCanvas_(columns, rows);

    for (let i = 0; i < this.frames.length; i++) {
      const frame = this.frames[i];
      const posX = (i % columns) * this.piskelController.getWidth();
      const posY = Math.floor(i / columns) * this.piskelController.getHeight();
      this.drawFrameInCanvas_(frame, canvas, posX, posY);
    }
    return canvas;
  };

  ns.PiskelRenderer.prototype.drawFrameInCanvas_ = function (
    frame,
    canvas,
    offsetWidth,
    offsetHeight
  ) {
    const context = canvas.getContext('2d');
    context.drawImage(
      frame,
      offsetWidth,
      offsetHeight,
      frame.width,
      frame.height);
  };

  ns.PiskelRenderer.prototype.createCanvas_ = function (columns, rows) {
    const width = columns * this.piskelController.getWidth();
    const height = rows * this.piskelController.getHeight();
    return pskl.utils.CanvasUtils.createCanvas(width, height);
  };
})();
