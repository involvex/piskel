(function () {
  const ns = $.namespace('pskl.service');

  ns.CurrentColorsService = function (piskelController) {
    this.piskelController = piskelController;
    // cache of current colors by history state
    this.cache = {};
    this.currentColors = [];

    this.cachedFrameProcessor =
      new pskl.model.frame.AsyncCachedFrameProcessor();
    this.cachedFrameProcessor.setFrameProcessor(
      this.getFrameColors_.bind(this));
    this.throttledUpdateCurrentColors_ = pskl.utils.FunctionUtils.throttle(
      this.updateCurrentColors_.bind(this),
      1000);
    this.paletteService = pskl.app.paletteService;
  };

  ns.CurrentColorsService.prototype.init = function () {
    $.subscribe(Events.HISTORY_STATE_SAVED, this.throttledUpdateCurrentColors_);
    $.subscribe(
      Events.HISTORY_STATE_LOADED,
      this.loadColorsFromCache_.bind(this));
  };

  ns.CurrentColorsService.prototype.getCurrentColors = function () {
    return this.currentColors;
  };

  ns.CurrentColorsService.prototype.setCurrentColors = function (colors) {
    const historyIndex = pskl.app.historyService.currentIndex;
    this.cache[historyIndex] = colors;
    if (colors.join('') !== this.currentColors.join('')) {
      this.currentColors = colors;
      $.publish(Events.CURRENT_COLORS_UPDATED);
    }
  };

  ns.CurrentColorsService.prototype.isCurrentColorsPaletteSelected_ =
    function () {
      const paletteId = pskl.UserSettings.get(pskl.UserSettings.SELECTED_PALETTE);
      const palette = this.paletteService.getPaletteById(paletteId);

      return palette.id === Constants.CURRENT_COLORS_PALETTE_ID;
    };

  ns.CurrentColorsService.prototype.loadColorsFromCache_ = function () {
    const historyIndex = pskl.app.historyService.currentIndex;
    const colors = this.cache[historyIndex];
    if (colors) {
      this.setCurrentColors(colors);
    } else {
      this.updateCurrentColors_();
    }
  };

  const batchAll = function (frames, job) {
    const batches = [];
    frames = frames.slice(0);
    while (frames.length) {
      batches.push(frames.splice(0, 10));
    }
    let result = Q([]);
    batches.forEach((batch) => {
      result = result.then((results) => {
        return Q.all(batch.map(job)).then((partials) => {
          return results.concat(partials);
        });
      });
    });
    return result;
  };

  ns.CurrentColorsService.prototype.updateCurrentColors_ = function () {
    const layers = this.piskelController.getLayers();

    // Concatenate all frames in a single array.
    const frames = layers
      .map((l) => {
        return l.getFrames();
      })
      .reduce((p, n) => {
        return p.concat(n);
      });

    batchAll(
      frames,
      (frame) => {
        return this.cachedFrameProcessor.get(frame);
      }
    ).then(
      (results) => {
        const colors = {};
        results.forEach((result) => {
          Object.keys(result).forEach((color) => {
            colors[color] = true;
          });
        });
        // Remove transparent color from used colors
        delete colors[pskl.utils.colorToInt(Constants.TRANSPARENT_COLOR)];

        const hexColors = Object.keys(colors).map((color) => {
          return pskl.utils.intToHex(color);
        });
        this.setCurrentColors(hexColors);
      });
  };

  ns.CurrentColorsService.prototype.isCurrentColorsPaletteSelected_ =
    function () {
      const paletteId = pskl.UserSettings.get(pskl.UserSettings.SELECTED_PALETTE);
      const palette = this.paletteService.getPaletteById(paletteId);

      return palette && palette.id === Constants.CURRENT_COLORS_PALETTE_ID;
    };

  ns.CurrentColorsService.prototype.loadColorsFromCache_ = function () {
    const historyIndex = pskl.app.historyService.currentIndex;
    const colors = this.cache[historyIndex];
    if (colors) {
      this.setCurrentColors(colors);
    }
  };

  ns.CurrentColorsService.prototype.getFrameColors_ = function (
    frame,
    processorCallback
  ) {
    const frameColorsWorker = new pskl.worker.framecolors.FrameColors(
      frame,
      ((event) => {
        processorCallback(event.data.colors);
      }),
      (() => {}),
      ((event) => {
        processorCallback({});
      }));
    frameColorsWorker.process();
  };
})();
