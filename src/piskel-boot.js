// Declare global pskl namespace for ESLint
/* global pskl */

(function () {
  /**
   * See @Gruntfile.js => after build, @@version is replaced by the build version
   */
  let version = "@@version";
  const versionHasNotBeenReplaced = version.indexOf("@@") === 0;
  if (versionHasNotBeenReplaced) {
    version = "";
  }

  if (!window.piskelReadyCallbacks) {
    window.piskelReadyCallbacks = [];
  }

  window._onPiskelReady = function () {
    const loadingMask = document.getElementById("loading-mask");
    loadingMask.style.opacity = 0;
    window.setTimeout(() => {
      loadingMask.parentNode.removeChild(loadingMask);
    }, 600);
    // Initialize pskl namespace if it doesn't exist
    window.pskl = window.pskl || {};
    if (window.pskl.app) {
      pskl.app.init();
    }
    pskl._releaseVersion = "@@releaseVersion";
    // cleanup
    window.pskl_exports = undefined;
    window.loadDebugScripts = undefined;
    window.done = undefined;

    // Run Piskel ready callbacks
    for (let i = 0; i < window.piskelReadyCallbacks.length; i++) {
      window.piskelReadyCallbacks[i]();
    }
  };

  const prefixPath = function (path) {
    if (window.pskl && window.pskl.appEngineToken_) {
      return "../" + path;
    } else {
      return path;
    }
  };

  const loadScript = function (src, callback) {
    src = prefixPath(src);
    const script = window.document.createElement("script");
    script.setAttribute("src", src);
    script.setAttribute("onload", callback);
    window.document.body.appendChild(script);
  };

  const loadStyle = function (src) {
    src = prefixPath(src);
    const link = document.createElement("link");
    link.setAttribute("href", src);
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    document.head.appendChild(link);
  };

  if (window.location.href.indexOf("debug") != -1) {
    window.pskl_exports = {};
    let scriptIndex = 0;
    window.loadNextScript = function () {
      if (scriptIndex == window.pskl_exports.scripts.length) {
        window._onPiskelReady();
      } else {
        loadScript(
          window.pskl_exports.scripts[scriptIndex],
          "loadNextScript()"
        );
        scriptIndex++;
      }
    };
    loadScript("piskel-script-list.js", "loadNextScript()");

    let styles;
    window.loadStyles = function () {
      styles = window.pskl_exports.styles;
      for (let i = 0; i < styles.length; i++) {
        loadStyle(styles[i]);
      }
    };

    window.reloadStyles = function () {
      for (let i = 0; i < styles.length; i++) {
        document.querySelector('link[href="' + styles[i] + '"]').remove();
        loadStyle(styles[i]);
      }
    };

    loadScript("piskel-style-list.js", "loadStyles()");
  } else {
    // Always use non-minified version to avoid constructor issues
    const script = "js/piskel-packaged" + version + ".js";

    loadStyle("css/piskel-style-packaged" + version + ".css");
    loadScript(script, "_onPiskelReady()");
  }
})();
