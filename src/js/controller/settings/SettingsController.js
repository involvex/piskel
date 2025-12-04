(function () {
  const ns = $.namespace('pskl.controller.settings');

  const settings = {
    user: {
      template: 'templates/settings/preferences.html',
      controller: ns.PreferencesController
    },
    resize: {
      template: 'templates/settings/resize.html',
      controller: ns.resize.ResizeController
    },
    export: {
      template: 'templates/settings/export.html',
      controller: ns.exportimage.ExportController
    },
    import: {
      template: 'templates/settings/import.html',
      controller: ns.ImportController
    },
    localstorage: {
      template: 'templates/settings/localstorage.html',
      controller: ns.LocalStorageController
    },
    save: {
      template: 'templates/settings/save.html',
      controller: ns.SaveController
    }
  };

  const SEL_SETTING_CLS = 'has-expanded-drawer';
  const EXP_DRAWER_CLS = 'expanded';

  ns.SettingsController = function (piskelController) {
    this.piskelController = piskelController;
    this.closeDrawerShortcut = pskl.service.keyboard.Shortcuts.MISC.CLOSE_POPUP;
    this.settingsContainer = document.querySelector(
      '[data-pskl-controller=settings]');
    this.drawerContainer = document.getElementById('drawer-container');
    this.isExpanded = false;
    this.currentSetting = null;
  };

  /**
   * @public
   */
  ns.SettingsController.prototype.init = function () {
    pskl.utils.Event.addEventListener(
      this.settingsContainer,
      'click',
      this.onSettingsContainerClick_,
      this);
    pskl.utils.Event.addEventListener(
      document.body,
      'click',
      this.onBodyClick_,
      this);
    $.subscribe(Events.CLOSE_SETTINGS_DRAWER, this.closeDrawer_.bind(this));
  };

  ns.SettingsController.prototype.onSettingsContainerClick_ = function (evt) {
    const setting = pskl.utils.Dom.getData(evt.target, 'setting');
    if (!setting) {
      return;
    }

    if (this.currentSetting != setting) {
      this.loadSetting_(setting);
    } else {
      this.closeDrawer_();
    }

    evt.stopPropagation();
    evt.preventDefault();
  };

  ns.SettingsController.prototype.onBodyClick_ = function (evt) {
    const target = evt.target;

    const isInDrawerContainer = pskl.utils.Dom.isParent(
      target,
      this.drawerContainer);
    const isInSettingsIcon = target.dataset.setting;
    const isInSettingsContainer = isInDrawerContainer || isInSettingsIcon;

    if (this.isExpanded && !isInSettingsContainer) {
      this.closeDrawer_();
    }
  };

  ns.SettingsController.prototype.loadSetting_ = function (setting) {
    this.drawerContainer.innerHTML = pskl.utils.Template.get(
      settings[setting].template);
    // when switching settings controller, destroy previously loaded controller
    this.destroyCurrentController_();

    this.currentSetting = setting;
    this.currentController = new settings[setting].controller(
      this.piskelController);
    this.currentController.init();

    pskl.app.shortcutService.registerShortcut(
      this.closeDrawerShortcut,
      this.closeDrawer_.bind(this));
    pskl.utils.Dom.removeClass(SEL_SETTING_CLS);
    const selectedSettingButton = document.querySelector(
      '[data-setting=' + setting + ']');
    if (selectedSettingButton) {
      selectedSettingButton.classList.add(SEL_SETTING_CLS);
    }
    this.settingsContainer.classList.add(EXP_DRAWER_CLS);

    this.isExpanded = true;
  };

  ns.SettingsController.prototype.closeDrawer_ = function () {
    pskl.utils.Dom.removeClass(SEL_SETTING_CLS);
    this.settingsContainer.classList.remove(EXP_DRAWER_CLS);

    this.isExpanded = false;
    this.currentSetting = null;
    document.activeElement.blur();

    this.destroyCurrentController_();
  };

  ns.SettingsController.prototype.destroyCurrentController_ = function () {
    if (this.currentController) {
      pskl.app.shortcutService.unregisterShortcut(this.closeDrawerShortcut);
      if (this.currentController.destroy) {
        this.currentController.destroy();
        this.currentController = null;
      }
    }
  };
})();
