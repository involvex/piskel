(function () {
  const ns = $.namespace('pskl.worker.imageprocessor');

  ns.ImageProcessorWorker = function () {
    let currentStep;
    let currentProgress;
    let currentTotal;

    const initStepCounter_ = function (total) {
      currentStep = 0;
      currentProgress = 0;
      currentTotal = total;
    };

    const postStep_ = function () {
      currentStep = currentStep + 1;
      const progress = ((currentStep / currentTotal) * 100).toFixed(1);
      if (progress != currentProgress) {
        currentProgress = progress;
        this.postMessage({
          type: 'STEP',
          progress: currentProgress,
          currentStep: currentStep,
          total: currentTotal
        });
      }
    };

    const componentToHex = function (c) {
      const hex = c.toString(16);
      return hex.length == 1 ? '0' + hex : hex;
    };

    const rgbToHex = function (r, g, b) {
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    const imageDataToGrid = function (imageData, width, height, transparent) {
      // Draw the zoomed-up pixels to a different canvas context
      const grid = [];
      for (let x = 0; x < width; x++) {
        grid[x] = [];
        postStep_();
        for (let y = 0; y < height; y++) {
          // Find the starting index in the one-dimensional image data
          const i = (y * width + x) * 4;
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];
          if (a < 125) {
            grid[x][y] = transparent;
          } else {
            grid[x][y] = rgbToHex(r, g, b);
          }
        }
      }
      return grid;
    };

    const getColorsMapFromImageData = function (imageData, width, height) {
      const grid = imageDataToGrid(imageData, width, height, 'transparent');

      const colorsMap = {};
      for (let i = 0; i < grid.length; i++) {
        postStep_();
        for (let j = 0; j < grid[i].length; j++) {
          const color = grid[i][j];
          if (color != 'transparent') {
            colorsMap[color] = true;
          }
        }
      }
      return colorsMap;
    };

    this.onmessage = function (event) {
      try {
        const data = event.data;

        initStepCounter_(data.width * 2);

        const colorsMap = getColorsMapFromImageData(
          data.imageData,
          data.width,
          data.height
        );

        this.postMessage({
          type: 'SUCCESS',
          colorsMap: colorsMap
        });
      } catch (e) {
        this.postMessage({
          type: 'ERROR',
          message: e.message
        });
      }
    };
  };
})();
