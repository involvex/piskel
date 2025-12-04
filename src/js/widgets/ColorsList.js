(function () {
  const ns = $.namespace('pskl.widgets');

  const DEFAULT_COLOR = '#000000';

  ns.ColorsList = function (container) {
    this.selectedIndex = -1;
    this.palette = new pskl.model.Palette('tmp', 'tmp', []);
    this.container = container;

    this.colorsList = this.container.querySelector('.colors-list');
    this.colorPreviewEl = this.container.querySelector('.color-preview');

    $(container).sortable({
      placeholder: 'colors-list-drop-proxy',
      update: this.onColorDrop_.bind(this),
      items: '.create-palette-color'
    });

    pskl.utils.Event.addEventListener(
      this.colorsList,
      'click',
      this.onColorContainerClick_,
      this
    );

    const colorPickerContainer = container.querySelector(
      '.color-picker-container'
    );
    this.hslRgbColorPicker = new pskl.widgets.HslRgbColorPicker(
      colorPickerContainer,
      this.onColorUpdated_.bind(this)
    );
    this.hslRgbColorPicker.init();
  };

  ns.ColorsList.prototype.setColors = function (colors) {
    if (colors.length === 0) {
      colors.push(DEFAULT_COLOR);
    }

    this.palette.setColors(colors);

    this.selectColor_(0);
    this.refresh_();
  };

  ns.ColorsList.prototype.getColors = function () {
    return this.palette.getColors();
  };

  ns.ColorsList.prototype.destroy = function () {
    pskl.utils.Event.removeAllEventListeners(this);

    $(this.container).sortable('destroy');

    this.hslRgbColorPicker.destroy();
    this.container = null;
    this.colorsList = null;
    this.colorPreviewEl = null;
  };

  /**
   * Lightweight refresh only changing the color of one element of the palette color list
   */
  ns.ColorsList.prototype.refreshColorElement_ = function (index) {
    const color = this.palette.get(this.selectedIndex);
    const element = document.querySelector(
      '[data-palette-index="' + index + '"]'
    );
    if (element) {
      element.style.background = color;
      element.classList.toggle('light-color', this.isLight_(color));
    }
  };

  ns.ColorsList.prototype.onColorContainerClick_ = function (evt) {
    const target = evt.target;
    if (target.classList.contains('create-palette-color')) {
      this.onPaletteColorClick_(evt, target);
    } else if (target.classList.contains('create-palette-new-color')) {
      this.onNewColorClick_(evt, target);
    } else if (target.classList.contains('create-palette-remove-color')) {
      this.onRemoveColorClick_(evt, target);
    }
    this.refresh_();
  };

  ns.ColorsList.prototype.onColorUpdated_ = function (color) {
    const strColor = color.toHexString();
    this.colorPreviewEl.style.background = strColor;
    if (this.palette) {
      this.palette.set(this.selectedIndex, strColor);
      this.refreshColorElement_(this.selectedIndex);
    }
  };

  ns.ColorsList.prototype.onPaletteColorClick_ = function (evt, target) {
    const index = parseInt(target.dataset.paletteIndex, 10);
    this.selectColor_(index);
  };

  ns.ColorsList.prototype.onRemoveColorClick_ = function (evt, target) {
    const colorElement = target.parentNode;
    const index = parseInt(colorElement.dataset.paletteIndex, 10);
    this.removeColor_(index);
  };

  ns.ColorsList.prototype.onNewColorClick_ = function (evt, target) {
    const newColor = this.palette.get(this.selectedIndex) || '#000000';
    this.palette.add(newColor);
    this.selectColor_(this.palette.size() - 1);
  };

  ns.ColorsList.prototype.refresh_ = function () {
    let html = '';
    const tpl = pskl.utils.Template.get('create-palette-color-template');
    const colors = this.palette.getColors();

    colors.forEach(
      (color, index) => {
        const isSelected = index === this.selectedIndex;

        html += pskl.utils.Template.replace(tpl, {
          color: color,
          index: index,
          ':selected': isSelected,
          ':light-color': this.isLight_(color)
        });
      });
    html += '<li class="create-palette-new-color">+</li>';

    this.colorsList.innerHTML = html;
  };

  ns.ColorsList.prototype.selectColor_ = function (index) {
    this.selectedIndex = index;
    this.hslRgbColorPicker.setColor(this.palette.get(index));
  };

  ns.ColorsList.prototype.removeColor_ = function (index) {
    this.palette.removeAt(index);
    this.refresh_();
  };

  ns.ColorsList.prototype.isLight_ = function (color) {
    const rgb = window.tinycolor(color).toRgb();
    return rgb.r + rgb.b + rgb.g > 128 * 3;
  };

  ns.ColorsList.prototype.onColorDrop_ = function (evt, drop) {
    const colorElement = drop.item.get(0);

    const oldIndex = parseInt(colorElement.dataset.paletteIndex, 10);
    const colors = document.querySelectorAll('.create-palette-color');
    const newIndex = Array.prototype.indexOf.call(colors, colorElement);
    this.palette.move(oldIndex, newIndex);

    this.selectedIndex = newIndex;

    this.refresh_();
  };
})();
