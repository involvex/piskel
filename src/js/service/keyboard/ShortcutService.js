(function () {
  const ns = $.namespace('pskl.service.keyboard');

  ns.ShortcutService = function () {
    this.shortcuts_ = [];
  };

  /**
   * @public
   */
  ns.ShortcutService.prototype.init = function () {
    document.body.addEventListener('keydown', this.onKeyDown_.bind(this));
  };

  /**
   * Add a keyboard shortcut
   * @param {pskl.service.keyboard.Shortcut} shortcut
   * @param {Function} callback should return true to let the original event perform its default action
   */
  ns.ShortcutService.prototype.registerShortcut = function (
    shortcut,
    callback
  ) {
    if (!(shortcut instanceof ns.Shortcut)) {
      throw 'Invalid shortcut argument, please use instances of pskl.service.keyboard.Shortcut';
    }

    if (typeof callback != 'function') {
      throw 'Invalid callback argument, please provide a function';
    }

    this.shortcuts_.push({
      shortcut: shortcut,
      callback: callback
    });
  };

  ns.ShortcutService.prototype.unregisterShortcut = function (shortcut) {
    let index = -1;
    this.shortcuts_.forEach((s, i) => {
      if (s.shortcut === shortcut) {
        index = i;
      }
    });
    if (index != -1) {
      this.shortcuts_.splice(index, 1);
    }
  };

  /**
   * @private
   */
  ns.ShortcutService.prototype.onKeyDown_ = function (evt) {
    const eventKey = ns.KeyUtils.createKeyFromEvent(evt);
    if (this.isInInput_(evt) || !eventKey) {
      return;
    }

    this.shortcuts_.forEach(
      (shortcutInfo) => {
        shortcutInfo.shortcut.getKeys().forEach(
          (shortcutKey) => {
            if (!ns.KeyUtils.equals(shortcutKey, eventKey)) {
              return;
            }

            const bubble = shortcutInfo.callback(eventKey.key);
            if (bubble !== true) {
              evt.preventDefault();
            }
            $.publish(Events.KEYBOARD_EVENT, [evt]);
          });
      });
  };

  ns.ShortcutService.prototype.isInInput_ = function (evt) {
    const targetTagName = evt.target.nodeName.toUpperCase();
    return targetTagName === 'INPUT' || targetTagName === 'TEXTAREA';
  };

  ns.ShortcutService.prototype.getShortcutById = function (id) {
    return pskl.utils.Array.find(this.getShortcuts(), (shortcut) => {
      return shortcut.getId() === id;
    });
  };

  ns.ShortcutService.prototype.getShortcuts = function () {
    const shortcuts = [];
    ns.Shortcuts.CATEGORIES.forEach((category) => {
      const shortcutMap = ns.Shortcuts[category];
      Object.keys(shortcutMap).forEach((shortcutKey) => {
        shortcuts.push(shortcutMap[shortcutKey]);
      });
    });
    return shortcuts;
  };

  ns.ShortcutService.prototype.updateShortcut = function (
    shortcut,
    keyAsString
  ) {
    const key = keyAsString.replace(/\s/g, '');

    const isForbiddenKey = ns.Shortcuts.FORBIDDEN_KEYS.indexOf(key) != -1;
    if (isForbiddenKey) {
      $.publish(Events.SHOW_NOTIFICATION, [
        {
          content: 'Key cannot be remapped (' + keyAsString + ')',
          hideDelay: 5000
        }
      ]);
    } else {
      this.removeKeyFromAllShortcuts_(key);
      shortcut.updateKeys([key]);
      $.publish(Events.SHORTCUTS_CHANGED);
    }
  };

  ns.ShortcutService.prototype.removeKeyFromAllShortcuts_ = function (key) {
    this.getShortcuts().forEach((s) => {
      if (s.removeKeys([key])) {
        $.publish(Events.SHOW_NOTIFICATION, [
          {
            content: 'Shortcut key removed for ' + s.getId(),
            hideDelay: 5000
          }
        ]);
      }
    });
  };

  /**
   * Restore the default piskel key for all shortcuts
   */
  ns.ShortcutService.prototype.restoreDefaultShortcuts = function () {
    this.getShortcuts().forEach((shortcut) => {
      shortcut.restoreDefault();
    });
    $.publish(Events.SHORTCUTS_CHANGED);
  };
})();
