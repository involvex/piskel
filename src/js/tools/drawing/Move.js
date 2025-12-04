/**
 * @provide pskl.tools.drawing.Move
 *
 * @require pskl.utils
 */
(function () {
  const ns = $.namespace('pskl.tools.drawing');

  ns.Move = function () {
    this.toolId = ns.Move.TOOL_ID;
    this.helpText = 'Move tool';
    this.shortcut = pskl.service.keyboard.Shortcuts.TOOL.MOVE;

    this.tooltipDescriptors = [
      { key: 'ctrl', description: 'Apply to all layers' },
      { key: 'shift', description: 'Apply to all frames' },
      { key: 'alt', description: 'Wrap canvas borders' }
    ];

    // Stroke's first point coordinates (set in applyToolAt)
    this.startCol = null;
    this.startRow = null;
  };

  /**
   * The move tool id is used by the ToolController and the BaseSelect and needs to be
   * easliy accessible
   */
  ns.Move.TOOL_ID = 'tool-move';

  pskl.utils.inherit(ns.Move, ns.BaseTool);

  /**
   * @override
   */
  ns.Move.prototype.applyToolAt = function (col, row, frame, overlay, event) {
    this.startCol = col;
    this.startRow = row;
    this.currentFrame = frame;
    this.currentFrameClone = frame.clone();
  };

  ns.Move.prototype.moveToolAt = function (col, row, frame, overlay, event) {
    const colDiff = col - this.startCol;
    const rowDiff = row - this.startRow;
    this.shiftFrame(colDiff, rowDiff, frame, this.currentFrameClone, event);
  };

  ns.Move.prototype.shiftFrame = function (
    colDiff,
    rowDiff,
    frame,
    reference,
    event
  ) {
    let color;
    const w = frame.getWidth();
    const h = frame.getHeight();
    for (let col = 0; col < w; col++) {
      for (let row = 0; row < h; row++) {
        let x = col - colDiff;
        let y = row - rowDiff;
        if (event.altKey) {
          x = (x + w) % w;
          y = (y + h) % h;
        }
        if (reference.containsPixel(x, y)) {
          color = reference.getPixel(x, y);
        } else {
          color = Constants.TRANSPARENT_COLOR;
        }
        frame.setPixel(col, row, color);
      }
    }
  };

  /**
   * @override
   */
  ns.Move.prototype.releaseToolAt = function (col, row, frame, overlay, event) {
    const colDiff = col - this.startCol;
    const rowDiff = row - this.startRow;

    const ctrlKey = pskl.utils.UserAgent.isMac ? event.metaKey : event.ctrlKey;
    pskl.tools.ToolsHelper.getTargetFrames(ctrlKey, event.shiftKey).forEach(
      (f) => {
        // for the current frame, the backup clone should be reused as reference
        // the current frame has been modified by the user action already
        const reference =
          this.currentFrame == f ? this.currentFrameClone : f.clone();
        this.shiftFrame(colDiff, rowDiff, f, reference, event);
      });
    this.raiseSaveStateEvent({
      colDiff: colDiff,
      rowDiff: rowDiff,
      ctrlKey: ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey
    });
  };

  ns.Move.prototype.replay = function (frame, replayData) {
    const event = {
      shiftKey: replayData.shiftKey,
      altKey: replayData.altKey,
      ctrlKey: replayData.ctrlKey
    };
    pskl.tools.ToolsHelper.getTargetFrames(
      event.ctrlKey,
      event.shiftKey
    ).forEach(
      (frame) => {
        this.shiftFrame(
          replayData.colDiff,
          replayData.rowDiff,
          frame,
          frame.clone(),
          event);
      });
  };

  ns.Move.prototype.supportsAlt = function () {
    return true;
  };
})();
