(function () {
  const ns = $.namespace('pskl.tools.transform');

  ns.TransformUtils = {
    VERTICAL: 'VERTICAL',
    HORIZONTAL: 'HORIZONTAL',
    flip: function (frame, axis) {
      const clone = frame.clone();
      const w = frame.getWidth();
      const h = frame.getHeight();

      clone.forEachPixel((color, x, y) => {
        if (axis === ns.TransformUtils.VERTICAL) {
          x = w - x - 1;
        } else if (axis === ns.TransformUtils.HORIZONTAL) {
          y = h - y - 1;
        }
        frame.setPixel(x, y, color);
      });

      return frame;
    },

    CLOCKWISE: 'clockwise',
    COUNTERCLOCKWISE: 'counterclockwise',
    rotate: function (frame, direction) {
      const clone = frame.clone();
      const w = frame.getWidth();
      const h = frame.getHeight();

      const max = Math.max(w, h);
      const xDelta = Math.ceil((max - w) / 2);
      const yDelta = Math.ceil((max - h) / 2);

      frame.forEachPixel((color, x, y) => {
        const _x = x;
        const _y = y;

        // Convert to square coords
        x = x + xDelta;
        y = y + yDelta;

        // Perform the rotation
        const tmpX = x;
        const tmpY = y;
        if (direction === ns.TransformUtils.CLOCKWISE) {
          x = tmpY;
          y = max - 1 - tmpX;
        } else if (direction === ns.TransformUtils.COUNTERCLOCKWISE) {
          y = tmpX;
          x = max - 1 - tmpY;
        }

        // Convert the coordinates back to the rectangular grid
        x = x - xDelta;
        y = y - yDelta;
        if (clone.containsPixel(x, y)) {
          frame.setPixel(_x, _y, clone.getPixel(x, y));
        } else {
          frame.setPixel(_x, _y, Constants.TRANSPARENT_COLOR);
        }
      });

      return frame;
    },

    getBoundaries: function (frames) {
      let minx = +Infinity;
      let miny = +Infinity;
      let maxx = 0;
      let maxy = 0;

      const transparentColorInt = pskl.utils.colorToInt(
        Constants.TRANSPARENT_COLOR
      );

      frames.forEach((frame) => {
        frame.forEachPixel((color, x, y) => {
          if (color !== transparentColorInt) {
            minx = Math.min(minx, x);
            maxx = Math.max(maxx, x);
            miny = Math.min(miny, y);
            maxy = Math.max(maxy, y);
          }
        });
      });

      return {
        minx: minx,
        maxx: maxx,
        miny: miny,
        maxy: maxy
      };
    },

    moveFramePixels: function (frame, dx, dy) {
      const clone = frame.clone();
      frame.forEachPixel((color, x, y) => {
        const _x = x;
        const _y = y;

        x -= dx;
        y -= dy;

        if (clone.containsPixel(x, y)) {
          frame.setPixel(_x, _y, clone.getPixel(x, y));
        } else {
          frame.setPixel(_x, _y, Constants.TRANSPARENT_COLOR);
        }
      });
    },

    center: function (frame) {
      // Figure out the boundary
      const boundaries = ns.TransformUtils.getBoundaries([frame]);

      // Calculate how much to move the pixels
      const bw = (boundaries.maxx - boundaries.minx + 1) / 2;
      const bh = (boundaries.maxy - boundaries.miny + 1) / 2;
      const fw = frame.width / 2;
      const fh = frame.height / 2;

      const dx = Math.floor(fw - bw - boundaries.minx);
      const dy = Math.floor(fh - bh - boundaries.miny);

      // Actually move the pixels

      ns.TransformUtils.moveFramePixels(frame, dx, dy);
      return frame;
    }
  };
})();
