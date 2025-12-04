(function () {
  const ns = $.namespace('pskl.utils');

  ns.Event = {};

  ns.Event.addEventListener = function (el, type, callback, scope, args) {
    if (typeof el === 'string') {
      el = document.querySelector(el);
    }

    const listener = {
      el: el,
      type: type,
      callback: callback,
      handler: args ? callback.bind(scope, args) : callback.bind(scope)
    };

    scope.__pskl_listeners = scope.__pskl_listeners || [];
    scope.__pskl_listeners.push(listener);
    el.addEventListener(type, listener.handler);
  };

  ns.Event.removeEventListener = function (el, type, callback, scope) {
    if (scope && scope.__pskl_listeners) {
      const listeners = scope.__pskl_listeners;
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        if (
          listener.callback === callback &&
          listener.el === el &&
          listener.type === type
        ) {
          el.removeEventListener(type, listeners[i].handler);
          listeners.splice(i, 1);
          break;
        }
      }
    }
  };

  ns.Event.removeAllEventListeners = function (scope) {
    if (scope && scope.__pskl_listeners) {
      const listeners = scope.__pskl_listeners;
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener.el.removeEventListener(listener.type, listener.handler);
      }
      scope.__pskl_listeners = [];
    }
  };
})();
