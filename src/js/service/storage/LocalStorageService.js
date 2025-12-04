(function () {
  const ns = $.namespace('pskl.service.storage');

  ns.LocalStorageService = function (piskelController) {
    if (piskelController === undefined) {
      throw 'Bad LocalStorageService initialization: <undefined piskelController>';
    }
    this.piskelController = piskelController;
  };

  ns.LocalStorageService.prototype.init = function () {};

  ns.LocalStorageService.prototype.save = function (piskel) {
    const name = piskel.getDescriptor().name;
    const description = piskel.getDescriptor().description;

    const serialized = pskl.utils.serialization.Serializer.serialize(piskel);
    if (pskl.app.localStorageService.getPiskel(name)) {
      const confirmOverwrite = window.confirm(
        'There is already a piskel saved as ' + name + '. Overwrite ?');
      if (!confirmOverwrite) {
        return Q.reject('Cancelled by user, "' + name + '" already exists');
      }
    }

    try {
      this.removeFromKeys_(name);
      this.addToKeys_(name, description, Date.now());
      window.localStorage.setItem('piskel.' + name, serialized);
      return Q.resolve();
    } catch (e) {
      return Q.reject(e.message);
    }
  };

  ns.LocalStorageService.prototype.load = function (name) {
    const piskelString = this.getPiskel(name);
    const key = this.getKey_(name);

    pskl.utils.serialization.Deserializer.deserialize(
      JSON.parse(piskelString),
      (piskel) => {
        pskl.app.piskelController.setPiskel(piskel);
      });
  };

  ns.LocalStorageService.prototype.remove = function (name) {
    this.removeFromKeys_(name);
    window.localStorage.removeItem('piskel.' + name);
  };

  ns.LocalStorageService.prototype.saveKeys_ = function (keys) {
    window.localStorage.setItem('piskel.keys', JSON.stringify(keys));
  };

  ns.LocalStorageService.prototype.removeFromKeys_ = function (name) {
    const keys = this.getKeys();
    const otherKeys = keys.filter((key) => {
      return key.name !== name;
    });

    this.saveKeys_(otherKeys);
  };

  ns.LocalStorageService.prototype.getKey_ = function (name) {
    const matches = this.getKeys().filter((key) => {
      return key.name === name;
    });
    if (matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
  };

  ns.LocalStorageService.prototype.addToKeys_ = function (
    name,
    description,
    date
  ) {
    const keys = this.getKeys();
    keys.push({
      name: name,
      description: description,
      date: date
    });
    this.saveKeys_(keys);
  };

  ns.LocalStorageService.prototype.getPiskel = function (name) {
    return window.localStorage.getItem('piskel.' + name);
  };

  ns.LocalStorageService.prototype.getKeys = function (name) {
    const keysString = window.localStorage.getItem('piskel.keys');
    return JSON.parse(keysString) || [];
  };
})();
