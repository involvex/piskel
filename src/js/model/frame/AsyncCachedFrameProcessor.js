(function () {
  const ns = $.namespace('pskl.model.frame');

  ns.AsyncCachedFrameProcessor = function (cacheResetInterval) {
    ns.CachedFrameProcessor.call(this, cacheResetInterval);
  };

  pskl.utils.inherit(ns.AsyncCachedFrameProcessor, ns.CachedFrameProcessor);

  /**
   * Retrieve the processed frame from the cache, in the (optional) namespace
   * If the first level cache is empty, attempt to clone it from 2nd level cache.
   * If second level cache is empty process the frame.
   * @param  {pskl.model.Frame} frame
   * @param  {String} namespace
   * @return {Object} the processed frame
   */
  ns.AsyncCachedFrameProcessor.prototype.get = function (frame, namespace) {
    let processedFrame = null;
    namespace = namespace || this.defaultNamespace;

    if (!this.cache_[namespace]) {
      this.cache_[namespace] = {};
    }

    const deferred = Q.defer();

    const cache = this.cache_[namespace];

    const key1 = frame.getHash();
    if (cache[key1]) {
      processedFrame = cache[key1];
    } else {
      const callback = this.onProcessorComplete_.bind(
        this,
        deferred,
        cache,
        key1);
      this.frameProcessor(frame, callback);
    }

    if (processedFrame) {
      deferred.resolve(processedFrame);
    }

    return deferred.promise;
  };

  ns.AsyncCachedFrameProcessor.prototype.onProcessorComplete_ = function (
    deferred,
    cache,
    key1,
    result
  ) {
    cache[key1] = result;
    deferred.resolve(result);
  };
})();
