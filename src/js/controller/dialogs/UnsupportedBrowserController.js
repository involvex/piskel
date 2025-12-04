(function () {
  const ns = $.namespace('pskl.controller.dialogs');

  ns.UnsupportedBrowserController = function () {};

  pskl.utils.inherit(
    ns.UnsupportedBrowserController,
    ns.AbstractDialogController
  );

  ns.UnsupportedBrowserController.prototype.init = function () {
    this.superclass.init.call(this);
    const currentUserAgentElement = document.querySelector('#current-user-agent');
    currentUserAgentElement.innerText = pskl.utils.UserAgent.getDisplayName();
  };
})();
