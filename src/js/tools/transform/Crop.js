(function () {
  const ns = $.namespace('pskl.tools.transform');

  ns.Crop = function () {
    this.toolId = 'tool-crop';
    this.helpText = 'Crop the sprite';
    this.tooltipDescriptors = [
      {
        description:
          'Crop to fit the content or the selection. ' +
          'Applies to all frames and layers!'
      }
    ];
  };

  // This transform tool is the only one that adapts to the current selection and can't
  // rely on the default AbstractTransformTool behavior.
  pskl.utils.inherit(ns.Crop, pskl.tools.Tool);

  ns.Crop.prototype.applyTransformation = function (evt) {
    const frames = this.getFrames_();

    let boundaries;
    if (pskl.app.selectionManager.currentSelection) {
      // If we have a selection, we will compute the boundaries of the selection instead
      // of looping on the frames.
      boundaries = this.getBoundariesForSelection_();
    } else {
      boundaries = pskl.tools.transform.TransformUtils.getBoundaries(frames);
    }

    const applied = this.applyTool_(frames, boundaries);
    if (applied) {
      this.raiseSaveStateEvent({
        boundaries: boundaries
      });
    }
  };

  ns.Crop.prototype.replay = function (frame, replayData) {
    const frames = this.getFrames_();
    this.applyTool_(frames, replayData.boundaries);
  };

  ns.Crop.prototype.applyTool_ = function (frames, boundaries) {
    if (boundaries.minx >= boundaries.maxx) {
      return false;
    }

    const currentPiskel = pskl.app.piskelController.getPiskel();
    const width = 1 + boundaries.maxx - boundaries.minx;
    const height = 1 + boundaries.maxy - boundaries.miny;

    if (
      width === currentPiskel.getWidth() &&
      height === currentPiskel.getHeight()
    ) {
      // Do not perform an unnecessary resize if it's a noop.
      return false;
    }

    frames.forEach((frame) => {
      pskl.tools.transform.TransformUtils.moveFramePixels(
        frame,
        -boundaries.minx,
        -boundaries.miny
      );
    });

    const piskel = pskl.utils.ResizeUtils.resizePiskel(currentPiskel, {
      width: 1 + boundaries.maxx - boundaries.minx,
      height: 1 + boundaries.maxy - boundaries.miny,
      origin: 'TOP-LEFT',
      resizeContent: false
    });

    // Clear the current selection.
    $.publish(Events.SELECTION_DISMISSED);

    // Replace the current piskel with the resized version.
    pskl.app.piskelController.setPiskel(piskel, {
      preserveState: true,
      // Saving is already handled by recording the transform tool action, no need for
      // an expensive snapshot.
      noSnapshot: true
    });

    return true;
  };

  /**
   * Retrieve the list of frames for the current piskel in a single flat array.
   */
  ns.Crop.prototype.getFrames_ = function () {
    const currentPiskel = pskl.app.piskelController.getPiskel();

    // Get all frames in a single array.
    const frames = currentPiskel
      .getLayers()
      .map((l) => {
        return l.getFrames();
      })
      .reduce((p, n) => {
        return p.concat(n);
      });

    return frames;
  };

  /**
   * Retrieve a boundaries object {minx, maxx, miny, maxy} for the current selection.
   */
  ns.Crop.prototype.getBoundariesForSelection_ = function () {
    const selectionManager = pskl.app.selectionManager;
    const pixels = selectionManager.currentSelection.pixels;

    // Fetch the first frame to perform out-of-bound checks.
    const currentPiskel = pskl.app.piskelController.getPiskel();
    const exampleFrame = currentPiskel.getLayerAt(0).getFrameAt(0);

    // Anything different from Constants.TRANSPARENT_COLOR toInt().
    const FAKE_COLOR = 1;
    // Create a fake frame reimplementing the forEachPixel API.
    const selectionFrame = {
      forEachPixel: function (callback) {
        for (let i = 0; i < pixels.length; i++) {
          const pixel = pixels[i];
          // Selections might contain out of bound pixels, filter those out.
          if (exampleFrame.containsPixel(pixel.col, pixel.row)) {
            callback(FAKE_COLOR, pixel.col, pixel.row);
          }
        }
      }
    };

    return pskl.tools.transform.TransformUtils.getBoundaries([selectionFrame]);
  };
})();
