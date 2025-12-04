(function () {
  const ns = $.namespace('pskl.controller.settings');

  const tabs = {
    misc: {
      template: 'templates/settings/preferences/misc.html',
      controller: ns.preferences.MiscPreferencesController
    },
    grid: {
      template: 'templates/settings/preferences/grid.html',
      controller: ns.preferences.GridPreferencesController
    },
    tile: {
      template: 'templates/settings/preferences/tile.html',
      controller: ns.preferences.TilePreferencesController
    }
  };

  ns.PreferencesController = function () {
    this.tabsWidget = new pskl.widgets.Tabs(
      tabs,
      this,
      pskl.UserSettings.PREFERENCES_TAB);
  };

  pskl.utils.inherit(
    ns.PreferencesController,
    pskl.controller.settings.AbstractSettingController);
  ns.PreferencesController.prototype.init = function () {
    const container = document.querySelector('.settings-section-preferences');
    this.tabsWidget.init(container);
  };

  ns.PreferencesController.prototype.destroy = function () {
    this.tabsWidget.destroy();
    this.superclass.destroy.call(this);
  };
})();
