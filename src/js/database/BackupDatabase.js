(function () {
  const ns = $.namespace('pskl.database');

  const DB_NAME = 'PiskelSessionsDatabase';
  const DB_VERSION = 1;

  // Simple wrapper to promisify a request.
  const _requestPromise = function (req) {
    const deferred = Q.defer();
    req.onsuccess = deferred.resolve.bind(deferred);
    req.onerror = deferred.reject.bind(deferred);
    return deferred.promise;
  };

  /**
   * The BackupDatabase handles all the database interactions related
   * to piskel snapshots continuously saved while during the usage of
   * Piskel.
   */
  ns.BackupDatabase = function () {
    this.db = null;
  };

  ns.BackupDatabase.DB_NAME = DB_NAME;

  /**
   * Open and initialize the database.
   * Returns a promise that resolves when the database is opened.
   */
  ns.BackupDatabase.prototype.init = function () {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = this.onUpgradeNeeded_.bind(this);

    return _requestPromise(request)
      .then(
        (event) => {
          this.db = event.target.result;
          return this.db;
        }
      )
      .catch((e) => {
        console.log('Could not initialize the piskel backup database');
      });
  };

  ns.BackupDatabase.prototype.onUpgradeNeeded_ = function (event) {
    // Set this.db early to allow migration scripts to access it in oncomplete.
    this.db = event.target.result;

    // Create an object store "piskels" with the autoIncrement flag set as true.
    const objectStore = this.db.createObjectStore('snapshots', {
      keyPath: 'id',
      autoIncrement: true
    });

    objectStore.createIndex('session_id', 'session_id', { unique: false });
    objectStore.createIndex('date', 'date', { unique: false });
    objectStore.createIndex('session_id, date', ['session_id', 'date'], {
      unique: false
    });

    objectStore.transaction.oncomplete = function (event) {
      // Nothing to do at the moment!
    }.bind(this);
  };

  ns.BackupDatabase.prototype.openObjectStore_ = function () {
    return this.db
      .transaction(['snapshots'], 'readwrite')
      .objectStore('snapshots');
  };

  /**
   * Send an add request for the provided snapshot.
   * Returns a promise that resolves the request event.
   */
  ns.BackupDatabase.prototype.createSnapshot = function (snapshot) {
    const objectStore = this.openObjectStore_();
    const request = objectStore.add(snapshot);
    return _requestPromise(request);
  };

  /**
   * Send a put request for the provided snapshot.
   * Returns a promise that resolves the request event.
   */
  ns.BackupDatabase.prototype.updateSnapshot = function (snapshot) {
    const objectStore = this.openObjectStore_();
    const request = objectStore.put(snapshot);
    return _requestPromise(request);
  };

  /**
   * Send a delete request for the provided snapshot.
   * Returns a promise that resolves the request event.
   */
  ns.BackupDatabase.prototype.deleteSnapshot = function (snapshot) {
    const objectStore = this.openObjectStore_();
    const request = objectStore.delete(snapshot.id);
    return _requestPromise(request);
  };

  /**
   * Send a get request for the provided snapshotId.
   * Returns a promise that resolves the request event.
   */
  ns.BackupDatabase.prototype.getSnapshot = function (snapshotId) {
    const objectStore = this.openObjectStore_();
    const request = objectStore.get(snapshotId);
    return _requestPromise(request).then((event) => {
      return event.target.result;
    });
  };

  /**
   * Get the last (most recent) snapshot that satisfies the accept filter provided.
   * Returns a promise that will resolve with the first matching snapshot (or null
   * if no valid snapshot is found).
   *
   * @param {Function} accept:
   *        Filter method that takes a snapshot as argument and should return true
   *        if the snapshot is valid.
   */
  ns.BackupDatabase.prototype.findLastSnapshot = function (accept) {
    // Create the backup promise.
    const deferred = Q.defer();

    // Open a transaction to the snapshots object store.
    const objectStore = this.db
      .transaction(['snapshots'])
      .objectStore('snapshots');

    const index = objectStore.index('date');
    const range = IDBKeyRange.upperBound(Infinity);
    index.openCursor(range, 'prev').onsuccess = function (event) {
      const cursor = event.target.result;
      const snapshot = cursor && cursor.value;

      // Resolve null if we couldn't find a matching snapshot.
      if (!snapshot) {
        deferred.resolve(null);
      } else if (accept(snapshot)) {
        deferred.resolve(snapshot);
      } else {
        cursor.continue();
      }
    };

    return deferred.promise;
  };

  /**
   * Retrieve all the snapshots for a given session id, sorted by descending date order.
   * Returns a promise that resolves with an array of snapshots.
   *
   * @param {String} sessionId
   *        The session id
   */
  ns.BackupDatabase.prototype.getSnapshotsBySessionId = function (sessionId) {
    // Create the backup promise.
    const deferred = Q.defer();

    // Open a transaction to the snapshots object store.
    const objectStore = this.db
      .transaction(['snapshots'])
      .objectStore('snapshots');

    // Loop on all the saved snapshots for the provided piskel id
    const index = objectStore.index('session_id, date');
    const keyRange = IDBKeyRange.bound([sessionId, 0], [sessionId, Infinity]);

    const snapshots = [];
    // Ordered by date in descending order.
    index.openCursor(keyRange, 'prev').onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        snapshots.push(cursor.value);
        cursor.continue();
      } else {
        // Consumed all piskel snapshots
        deferred.resolve(snapshots);
      }
    };

    return deferred.promise;
  };

  ns.BackupDatabase.prototype.getSessions = function () {
    // Create the backup promise.
    const deferred = Q.defer();

    // Open a transaction to the snapshots object store.
    const objectStore = this.db
      .transaction(['snapshots'])
      .objectStore('snapshots');

    const sessions = {};

    const _createSession = function (snapshot) {
      sessions[snapshot.session_id] = {
        startDate: snapshot.date,
        endDate: snapshot.date,
        name: snapshot.name,
        description: snapshot.description,
        id: snapshot.session_id,
        count: 1
      };
    };

    const _updateSession = function (snapshot) {
      const s = sessions[snapshot.session_id];
      s.startDate = Math.min(s.startDate, snapshot.date);
      s.endDate = Math.max(s.endDate, snapshot.date);
      s.count++;

      if (s.endDate === snapshot.date) {
        // If the endDate was updated, update also the session metadata to
        // reflect the latest state.
        s.name = snapshot.name;
        s.description = snapshot.description;
      }
    };

    const index = objectStore.index('date');
    const range = IDBKeyRange.upperBound(Infinity);
    index.openCursor(range, 'prev').onsuccess = function (event) {
      const cursor = event.target.result;
      const snapshot = cursor && cursor.value;
      if (!snapshot) {
        deferred.resolve(sessions);
      } else {
        if (sessions[snapshot.session_id]) {
          _updateSession(snapshot);
        } else {
          _createSession(snapshot);
        }
        cursor.continue();
      }
    };

    return deferred.promise.then((sessions) => {
      // Convert the sessions map to an array.
      return Object.keys(sessions).map((key) => {
        return sessions[key];
      });
    });
  };

  ns.BackupDatabase.prototype.deleteSnapshotsForSession = function (sessionId) {
    // Create the backup promise.
    const deferred = Q.defer();

    // Open a transaction to the snapshots object store.
    const objectStore = this.openObjectStore_();

    // Loop on all the saved snapshots for the provided piskel id
    const index = objectStore.index('session_id');
    const keyRange = IDBKeyRange.only(sessionId);

    index.openCursor(keyRange).onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        deferred.resolve();
      }
    };

    return deferred.promise;
  };
})();
