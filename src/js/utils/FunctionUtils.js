(function () {
  const ns = $.namespace('pskl.utils');

  ns.FunctionUtils = {
    /**
     * Returns a memoized version of the provided function.
     */
    memo: function (fn, cache, scope) {
      const memoized = function () {
        const key = Array.prototype.join.call(arguments, '-');
        if (!cache[key]) {
          cache[key] = fn.apply(scope, arguments);
        }
        return cache[key];
      };
      return memoized;
    },

    /**
     * Returns a throttled version of the provided method, that will be called at most
     * every X milliseconds, where X is the provided interval.
     */
    throttle: function (fn, interval) {
      let last;
      let timer;
      return function () {
        const now = Date.now();
        if (last && now < last + interval) {
          clearTimeout(timer);
          timer = setTimeout(() => {
            last = now;
            fn();
          }, interval);
        } else {
          last = now;
          fn();
        }
      };
    }
  };
})();
