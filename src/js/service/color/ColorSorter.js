(function () {
  const ns = $.namespace('pskl.service.color');

  const LOW_SAT = 0.1;
  const LOW_LUM = 0.1;
  const HI_LUM = 0.9;

  const HUE_STEP = 36;
  const HUE_BAGS = 10;
  const HUE_BOUNDS = [];
  for (let i = 0; i < HUE_BAGS; i++) {
    HUE_BOUNDS.push(i * HUE_STEP);
  }

  ns.ColorSorter = function () {
    this.colorsHslMap_ = {};
  };

  ns.ColorSorter.prototype.sort = function (colors) {
    this.colorsHslMap_ = {};

    colors.forEach(
      (color) => {
        this.colorsHslMap_[color] = window.tinycolor(color).toHsl();
      });
    // sort by most frequent color
    let darkColors = colors.filter(
      (c) => {
        const hsl = this.colorsHslMap_[c];
        return hsl.l <= LOW_LUM;
      });
    let brightColors = colors.filter(
      (c) => {
        const hsl = this.colorsHslMap_[c];
        return hsl.l >= HI_LUM;
      });
    let desaturatedColors = colors
      .filter((c) => {
        return brightColors.indexOf(c) === -1 && darkColors.indexOf(c) === -1;
      })
      .filter(
        (c) => {
          const hsl = this.colorsHslMap_[c];
          return hsl.s <= LOW_SAT;
        });
    darkColors = this.sortOnHslProperty_(darkColors, 'l');
    brightColors = this.sortOnHslProperty_(brightColors, 'l');
    desaturatedColors = this.sortOnHslProperty_(desaturatedColors, 'h');

    const sortedColors = darkColors.concat(brightColors, desaturatedColors);

    const regularColors = colors.filter((c) => {
      return sortedColors.indexOf(c) === -1;
    });

    const regularColorsBags = HUE_BOUNDS.map(
      (hue) => {
        const bagColors = regularColors.filter(
          (color) => {
            const hsl = this.colorsHslMap_[color];
            return hsl.h >= hue && hsl.h < hue + HUE_STEP;
          });
        return this.sortRegularColors_(bagColors);
      });
    return Array.prototype.concat.apply(sortedColors, regularColorsBags);
  };

  ns.ColorSorter.prototype.sortRegularColors_ = function (colors) {
    const sortedColors = colors.sort(
      (c1, c2) => {
        const hsl1 = this.colorsHslMap_[c1];
        const hsl2 = this.colorsHslMap_[c2];
        const hDiff = Math.abs(hsl1.h - hsl2.h);
        const sDiff = Math.abs(hsl1.s - hsl2.s);
        const lDiff = Math.abs(hsl1.l - hsl2.l);
        if (hDiff < 10) {
          if (sDiff > lDiff) {
            return this.compareValues_(hsl1.s, hsl2.s);
          } else {
            return this.compareValues_(hsl1.l, hsl2.l);
          }
        } else {
          return this.compareValues_(hsl1.h, hsl2.h);
        }
      });
    return sortedColors;
  };

  ns.ColorSorter.prototype.sortOnHslProperty_ = function (colors, property) {
    return colors.sort(
      (c1, c2) => {
        const hsl1 = this.colorsHslMap_[c1];
        const hsl2 = this.colorsHslMap_[c2];
        return this.compareValues_(hsl1[property], hsl2[property]);
      });
  };

  ns.ColorSorter.prototype.compareValues_ = function (v1, v2) {
    if (v1 > v2) {
      return 1;
    } else if (v1 < v2) {
      return -1;
    }
    return 0;
  };
})();
