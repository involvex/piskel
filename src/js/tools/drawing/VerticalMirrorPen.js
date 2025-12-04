(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.VerticalMirrorPen = function () {
    this.superclass.constructor.call(this);

    this.toolId = 'tool-vertical-mirror-pen';
    this.helpText = 'Vertical Mirror pen';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.MIRROR_PEN;

    this.tooltipDescriptors = [
      { key: 'ctrl', description: 'Use horizontal axis' },
      { key: 'shift', description: 'Use horizontal and vertical axis' }
    ];
  };

  pskl.utils.inherit(ns.VerticalMirrorPen, ns.SimplePen);

  /**
   * @override
   */
  ns.VerticalMirrorPen.prototype.applyToolAt = function (
    col,
    row,
    frame,
    overlay,
    event
  ) {
    const color = this.getToolColor();
    this.drawUsingPenSize(color, col, row, frame, overlay);

    const mirroredCol = this.getSymmetricCol_(col, frame);
    const mirroredRow = this.getSymmetricRow_(row, frame);

    const hasCtrlKey = pskl.utils.UserAgent.isMac ? event.metaKey : event.ctrlKey;
    if (!hasCtrlKey) {
      this.drawUsingPenSize(color, mirroredCol, row, frame, overlay);
    }

    if (event.shiftKey || hasCtrlKey) {
      this.drawUsingPenSize(color, col, mirroredRow, frame, overlay);
    }

    if (event.shiftKey) {
      this.drawUsingPenSize(color, mirroredCol, mirroredRow, frame, overlay);
    }

    this.previousCol = col;
    this.previousRow = row;
  };

  ns.VerticalMirrorPen.prototype.getSymmetricCol_ = function (col, frame) {
    return frame.getWidth() - col - this.getPenSizeOffset_();
  };

  ns.VerticalMirrorPen.prototype.getSymmetricRow_ = function (row, frame) {
    return frame.getHeight() - row - this.getPenSizeOffset_();
  };

  /**
   * Depending on the pen size, the mirrored index need to have an offset of 1 pixel.
   */
  ns.VerticalMirrorPen.prototype.getPenSizeOffset_ = function (row, frame) {
    return pskl.app.penSizeService.getPenSize() % 2;
  };
})();
