(function () {
  const ns = $.namespace('pskl.controller');

  ns.LayersListController = function (piskelController) {
    this.piskelController = piskelController;
    this.layerPreviewShortcut =
      pskl.service.keyboard.Shortcuts.MISC.LAYER_PREVIEW;
    this.startRenamingCurrentLayer_ =
      this.startRenamingCurrentLayer_.bind(this);
    this.onRenameInput_ = this.onRenameInput_.bind(this);
  };

  ns.LayersListController.prototype.init = function () {
    this.isRenaming = false;

    this.layerItemTemplate_ = pskl.utils.Template.get('layer-item-template');
    this.layerNameInputTemplate_ = pskl.utils.Template.get(
      'layer-name-input-template');
    this.rootEl = document.querySelector('.layers-list-container');
    this.layersListEl = document.querySelector('.layers-list');
    this.toggleLayerPreviewEl = document.querySelector(
      '.layers-toggle-preview');
    this.rootEl.addEventListener('click', this.onClick_.bind(this));
    this.toggleLayerPreviewEl.addEventListener(
      'click',
      this.toggleLayerPreview_.bind(this));
    this.createButtonTooltips_();
    this.initToggleLayerPreview_();

    this.renderLayerList_();
    this.updateToggleLayerPreview_();

    $.subscribe(Events.PISKEL_RESET, this.renderLayerList_.bind(this));
    $.subscribe(
      Events.USER_SETTINGS_CHANGED,
      this.onUserSettingsChange_.bind(this));
  };

  ns.LayersListController.prototype.renderLayerList_ = function () {
    // Backup scroll before refresh.
    const scrollTop = this.layersListEl.scrollTop;

    this.layersListEl.innerHTML = '';
    const layers = this.piskelController.getLayers();
    layers.forEach(this.addLayerItem.bind(this));
    this.updateButtonStatus_();

    // Restore scroll
    this.layersListEl.scrollTop = scrollTop;

    // Ensure the currently the selected layer is visible.
    const currentLayerEl = this.layersListEl.querySelector('.current-layer-item');
    if (currentLayerEl) {
      currentLayerEl.scrollIntoViewIfNeeded(false);
    }
  };

  ns.LayersListController.prototype.createButtonTooltips_ = function () {
    const addTooltip = pskl.utils.TooltipFormatter.format(
      'Create a layer',
      null,
      [{ key: 'shift', description: 'Clone current layer' }]);
    const addButton = this.rootEl.querySelector('[data-action="add"]');
    addButton.setAttribute('title', addTooltip);

    const moveDownTooltip = pskl.utils.TooltipFormatter.format(
      'Move layer down',
      null,
      [{ key: 'shift', description: 'Move to the bottom' }]);
    const moveDownButton = this.rootEl.querySelector('[data-action="down"]');
    moveDownButton.setAttribute('title', moveDownTooltip);

    const moveUpTooltip = pskl.utils.TooltipFormatter.format(
      'Move layer up',
      null,
      [{ key: 'shift', description: 'Move to the top' }]);
    const moveUpButton = this.rootEl.querySelector('[data-action="up"]');
    moveUpButton.setAttribute('title', moveUpTooltip);
  };

  ns.LayersListController.prototype.initToggleLayerPreview_ = function () {
    const descriptors = [{ description: 'Opacity defined in PREFERENCES' }];
    const helpText = 'Preview all layers';

    pskl.app.shortcutService.registerShortcut(
      this.layerPreviewShortcut,
      this.toggleLayerPreview_.bind(this));
    const tooltip = pskl.utils.TooltipFormatter.format(
      helpText,
      this.layerPreviewShortcut,
      descriptors);
    this.toggleLayerPreviewEl.setAttribute('title', tooltip);
  };

  ns.LayersListController.prototype.updateButtonStatus_ = function () {
    const layers = this.piskelController.getLayers();
    const index = this.piskelController.getCurrentLayerIndex();

    const isLast = index === 0;
    const isOnly = layers.length === 1;
    const isFirst = index === layers.length - 1;

    this.toggleButtonDisabledState_('up', isFirst);
    this.toggleButtonDisabledState_('down', isLast);
    this.toggleButtonDisabledState_('merge', isLast);
    this.toggleButtonDisabledState_('delete', isOnly);
  };

  ns.LayersListController.prototype.toggleButtonDisabledState_ = function (
    buttonAction,
    isDisabled
  ) {
    const button = document.querySelector(
      '.layers-button[data-action="' + buttonAction + '"]');
    if (isDisabled) {
      button.setAttribute('disabled', 'disabled');
      // Disabled/focused buttons consume key events on Firefox, so make sure to blur.
      button.blur();
    } else {
      button.removeAttribute('disabled');
    }
  };

  ns.LayersListController.prototype.updateToggleLayerPreview_ = function () {
    const enabledClassname = 'layers-toggle-preview-enabled';
    if (pskl.UserSettings.get(pskl.UserSettings.LAYER_PREVIEW)) {
      this.toggleLayerPreviewEl.classList.add(enabledClassname);
    } else {
      this.toggleLayerPreviewEl.classList.remove(enabledClassname);
    }
  };

  ns.LayersListController.prototype.onUserSettingsChange_ = function (
    evt,
    name,
    value
  ) {
    if (name == pskl.UserSettings.LAYER_PREVIEW) {
      this.updateToggleLayerPreview_();
    }
  };

  ns.LayersListController.prototype.addLayerItem = function (layer, index) {
    const isSelected = this.piskelController.getCurrentLayer() === layer;
    const isRenaming = isSelected && this.isRenaming;
    const layerItemHtml = pskl.utils.Template.replace(this.layerItemTemplate_, {
      layername: layer.getName(),
      layerindex: index,
      'isselected:current-layer-item': isSelected,
      opacity: layer.getOpacity()
    });
    const layerItem = pskl.utils.Template.createFromHTML(layerItemHtml);
    this.layersListEl.insertBefore(layerItem, this.layersListEl.firstChild);
    if (layerItem.offsetWidth < layerItem.scrollWidth) {
      var layerNameEl = layerItem.querySelector('.layer-name');
      layerNameEl.classList.add('overflowing-name');
      layerNameEl.setAttribute('title', layer.getName());
      layerNameEl.setAttribute('rel', 'tooltip');
    }
    if (isSelected) {
      layerItem.removeEventListener(
        'dblclick',
        this.startRenamingCurrentLayer_);
      layerItem.addEventListener('dblclick', this.startRenamingCurrentLayer_);
    }
    if (isRenaming) {
      const layerNameInputHtml = pskl.utils.Template.replace(
        this.layerNameInputTemplate_,
        {
          layername: layer.getName()
        });
      const layerNameInput =
        pskl.utils.Template.createFromHTML(layerNameInputHtml);
      var layerNameEl = layerItem.querySelector('.layer-name');
      layerItem.replaceChild(layerNameInput, layerNameEl);
      layerNameInput.removeEventListener('blur', this.onRenameInput_);
      layerNameInput.removeEventListener('keydown', this.onRenameInput_);
      layerNameInput.addEventListener('blur', this.onRenameInput_);
      layerNameInput.addEventListener('keydown', this.onRenameInput_);
      layerNameInput.focus();
      layerNameInput.select();
    }
    const opacity = layer.getOpacity();
    if (opacity == 1) {
      layerItem.querySelector('.layer-item-opacity').style.color = '#ffd700';
    } else if (opacity == 0) {
      layerItem.querySelector('.layer-item-opacity').style.color = '#969696';
    } else {
      layerItem.querySelector('.layer-item-opacity').style.color = '#ffffff';
    }
  };

  ns.LayersListController.prototype.onClick_ = function (evt) {
    const el = evt.target || evt.srcElement;
    let index;
    if (el.classList.contains('layer-name')) {
      const currentIndex = this.piskelController.getCurrentLayerIndex();
      index = pskl.utils.Dom.getData(el, 'layerIndex');
      if (index != currentIndex) {
        const currentItem = el.parentElement.parentElement.querySelector(
          '.current-layer-item');
        currentItem.removeEventListener(
          'dblclick',
          this.startRenamingCurrentLayer_);
        this.piskelController.setCurrentLayerIndex(parseInt(index, 10));
      }
    } else if (el.classList.contains('layer-item-opacity')) {
      index = pskl.utils.Dom.getData(el, 'layerIndex');
      const layer = this.piskelController.getLayerAt(parseInt(index, 10));
      const opacity = window.prompt(
        'Set layer opacity (value between 0 and 1)',
        layer.getOpacity());
      this.piskelController.setLayerOpacityAt(index, opacity);
    } else {
      const containingButton = el.closest('.button');
      if (containingButton && containingButton.classList.contains('button')) {
        this.onButtonClick_(containingButton, evt);
      }
    }
  };

  ns.LayersListController.prototype.startRenamingCurrentLayer_ = function () {
    this.isRenaming = true;
    this.renderLayerList_();
  };

  ns.LayersListController.prototype.onRenameInput_ = function (evt) {
    const el = evt.target || evt.srcElement;
    if (evt.key === 'Enter') {
      this.finishRenamingCurrentLayer_(el, el.value);
    } else if (!evt.key || evt.key === 'Escape') {
      this.finishRenamingCurrentLayer_(el);
    }
  };

  ns.LayersListController.prototype.finishRenamingCurrentLayer_ = function (
    input,
    newName
  ) {
    if (newName) {
      const index = this.piskelController.getCurrentLayerIndex();
      this.piskelController.renameLayerAt(index, newName);
    }
    input.removeEventListener('blur', this.onRenameInput_);
    input.removeEventListener('keydown', this.onRenameInput_);
    this.isRenaming = false;
    this.renderLayerList_();
  };

  ns.LayersListController.prototype.mergeDownCurrentLayer_ = function () {
    const index = this.piskelController.getCurrentLayerIndex();
    this.piskelController.mergeDownLayerAt(index);
    this.renderLayerList_();
  };

  ns.LayersListController.prototype.onButtonClick_ = function (button, evt) {
    const action = button.getAttribute('data-action');
    if (action == 'up') {
      this.piskelController.moveLayerUp(evt.shiftKey);
    } else if (action == 'down') {
      this.piskelController.moveLayerDown(evt.shiftKey);
    } else if (action == 'add') {
      if (evt.shiftKey) {
        this.piskelController.duplicateCurrentLayer();
      } else {
        this.piskelController.createLayer();
      }
    } else if (action == 'delete') {
      this.piskelController.removeCurrentLayer();
    } else if (action == 'merge') {
      this.mergeDownCurrentLayer_();
    } else if (action == 'edit') {
      this.startRenamingCurrentLayer_();
    }
  };

  ns.LayersListController.prototype.toggleLayerPreview_ = function () {
    const currentValue = pskl.UserSettings.get(pskl.UserSettings.LAYER_PREVIEW);
    const currentLayerOpacity = pskl.UserSettings.get(
      pskl.UserSettings.LAYER_OPACITY);
    const showLayerPreview = !currentValue;
    pskl.UserSettings.set(pskl.UserSettings.LAYER_PREVIEW, showLayerPreview);

    if (showLayerPreview && currentLayerOpacity === 0) {
      pskl.UserSettings.set(
        pskl.UserSettings.LAYER_OPACITY,
        Constants.DEFAULT.LAYER_OPACITY);
    }
  };
})();
