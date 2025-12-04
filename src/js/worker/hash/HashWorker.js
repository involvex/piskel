(function () {
  const ns = $.namespace('pskl.worker.hash');

  ns.HashWorker = function () {
    const hashCode = function (str) {
      let hash = 0;
      if (str.length !== 0) {
        for (let i = 0, l = str.length; i < l; i++) {
          const chr = str.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0; // Convert to 32bit integer
        }
      }
      return hash;
    };

    this.onmessage = function (event) {
      try {
        const data = event.data;
        const str = data.str;
        const hash = hashCode(str);
        this.postMessage({
          type: 'SUCCESS',
          hash: hash
        });
      } catch (e) {
        this.postMessage({
          type: 'ERROR',
          message: e.message
        });
      }
    };
  };
})();
