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
    },

    /**
     * Convert hex color to RGB object
     * @param {string} hex - Hex color string (e.g., "#FF0000" or "FF0000")
     * @return {Object} RGB object with r, g, b properties
     */
    hexToRgb: function (hex) {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Parse hex values
      const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    /**
     * Convert RGB values to hex color string
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @return {string} Hex color string
     */
    rgbToHex: function (r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  };
})();
