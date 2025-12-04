(function () {
  const ns = $.namespace('pskl.utils');

  ns.Array = {
    find: function (array, filterFn) {
      let match = null;
      array = Array.isArray(array) ? array : [];
      const filtered = array.filter(filterFn);
      if (filtered.length) {
        match = filtered[0];
      }
      return match;
    },

    /**
     * Split a provided array in a given amount of chunks.
     * For instance [1,2,3,4] chunked in 2 parts will be [1,2] & [3,4].
     * @param  {Array} array the array to chunk
     * @param  {Number} chunksCount the number of chunks to create
     * @return {Array<Array>} array of arrays containing the items of the original array
     */
    chunk: function (array, chunksCount) {
      const chunks = [];

      // We cannot have more chunks than array items.
      chunksCount = Math.min(chunksCount, array.length);

      // chunksCount should be at least 1
      chunksCount = Math.max(1, chunksCount);

      const step = Math.round(array.length / chunksCount);
      for (let i = 0; i < chunksCount; i++) {
        const isLast = i == chunksCount - 1;
        const end = isLast ? array.length : (i + 1) * step;
        chunks.push(array.slice(i * step, end));
      }
      return chunks;
    }
  };
})();
