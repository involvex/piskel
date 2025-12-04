(function () {
  const ns = $.namespace('pskl.controller.settings');
  ns.AbstractSettingController = function () {};

  ns.AbstractSettingController.prototype.addEventListener = function (
    el,
    type,
    callback
  ) {
    pskl.utils.Event.addEventListener(el, type, callback, this);
  };

  ns.AbstractSettingController.prototype.destroy = function () {
    pskl.utils.Event.removeAllEventListeners(this);
    this.nullifyDomReferences_();
  };

  ns.AbstractSettingController.prototype.nullifyDomReferences_ = function () {
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const isHTMLElement = this[key] && this[key].nodeName;
        if (isHTMLElement) {
          this[key] = null;
        }
      }
    }
  };
})();
