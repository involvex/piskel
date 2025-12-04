(function () {
  const ns = $.namespace('pskl.utils');

  ns.ColorUtils = {
    getUnusedColor: function (usedColors) {
      usedColors = usedColors || [];
      // create check map
      const colorMap = {};
      usedColors.forEach((color) => {
        colorMap[color.toUpperCase()] = true;
      });

      // start with white
      const color = {
        r: 255,
        g: 255,
        b: 0
      };
      let match = null;
      while (true) {
        const hex = window.tinycolor(color).toHexString().toUpperCase();

        if (!colorMap[hex]) {
          match = hex;
          break;
        } else {
          // pick a non null component to decrease its value
          const component =
            (color.r && 'r') || (color.g && 'g') || (color.b && 'b');
          if (component) {
            color[component] = color[component] - 1;
          } else {
            // no component available, no match found
            break;
          }
        }
      }

      return match;
    }
  };
})();
