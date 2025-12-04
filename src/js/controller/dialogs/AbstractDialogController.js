(function () {
  const ns = $.namespace('pskl.controller.dialogs');

  ns.AbstractDialogController = function () {};

  ns.AbstractDialogController.prototype.init = function () {
    const closeButton = document.querySelector('.dialog-close');
    this.addEventListener_(closeButton, 'click', this.closeDialog);
  };

  ns.AbstractDialogController.prototype.addEventListener_ = function (
    el,
    type,
    cb
  ) {
    pskl.utils.Event.addEventListener(el, type, cb, this);
  };

  ns.AbstractDialogController.prototype.destroy = function () {
    pskl.utils.Event.removeAllEventListeners(this);
  };

  ns.AbstractDialogController.prototype.closeDialog = function () {
    $.publish(Events.DIALOG_HIDE);
  };

  ns.AbstractDialogController.prototype.setTitle = function (title) {
    const dialogTitle = document.querySelector('.dialog-title');
    if (dialogTitle) {
      dialogTitle.innerText = title;
    }
  };
})();
