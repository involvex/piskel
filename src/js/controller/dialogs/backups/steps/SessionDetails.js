(function () {
  const ns = $.namespace('pskl.controller.dialogs.backups.steps');

  // Should match the preview dimensions defined in dialogs-browse-backups.css
  const PREVIEW_SIZE = 60;

  ns.SessionDetails = function (
    piskelController,
    backupsController,
    container
  ) {
    this.piskelController = piskelController;
    this.backupsController = backupsController;
    this.container = container;
  };

  ns.SessionDetails.prototype.init = function () {
    this.backButton = this.container.querySelector('.back-button');
    this.addEventListener(this.backButton, 'click', this.onBackClick_);
    this.addEventListener(this.container, 'click', this.onContainerClick_);
  };

  ns.SessionDetails.prototype.destroy = function () {
    pskl.utils.Event.removeAllEventListeners(this);
  };

  ns.SessionDetails.prototype.addEventListener = function (el, type, cb) {
    pskl.utils.Event.addEventListener(el, type, cb, this);
  };

  ns.SessionDetails.prototype.onShow = function () {
    const sessionId = this.backupsController.backupsData.selectedSession;
    pskl.app.backupService
      .getSnapshotsBySessionId(sessionId)
      .then(
        (snapshots) => {
          const html = this.getMarkupForSnapshots_(snapshots);
          this.container.querySelector('.snapshot-list').innerHTML = html;

          // Load the image of the first frame for each sprite and update the list.
          snapshots.forEach(
            (snapshot) => {
              this.updateSnapshotPreview_(snapshot);
            });
        }
      )
      .catch(
        () => {
          const html = pskl.utils.Template.get('snapshot-list-error');
          this.container.querySelector('.snapshot-list').innerHTML = html;
        });
  };

  ns.SessionDetails.prototype.getMarkupForSnapshots_ = function (snapshots) {
    if (snapshots.length === 0) {
      // This should normally never happen, all sessions have at least one snapshot and snapshots
      // can not be individually deleted.
      console.warn('Could not retrieve snapshots for a session');
      return pskl.utils.Template.get('snapshot-list-empty');
    }

    const sessionItemTemplate = pskl.utils.Template.get('snapshot-list-item');
    return snapshots.reduce((previous, snapshot) => {
      const view = {
        id: snapshot.id,
        name: snapshot.name,
        description: snapshot.description ? '- ' + snapshot.description : '',
        date: pskl.utils.DateUtils.format(
          snapshot.date,
          'the {{Y}}/{{M}}/{{D}} at {{H}}:{{m}}'
        ),
        frames: snapshot.frames === 1 ? '1 frame' : snapshot.frames + ' frames',
        resolution: pskl.utils.StringUtils.formatSize(
          snapshot.width,
          snapshot.height
        ),
        fps: snapshot.fps
      };
      return previous + pskl.utils.Template.replace(sessionItemTemplate, view);
    }, '');
  };

  ns.SessionDetails.prototype.updateSnapshotPreview_ = function (snapshot) {
    pskl.utils.serialization.Deserializer.deserialize(
      JSON.parse(snapshot.serialized),
      (piskel) => {
        const selector =
          '.snapshot-item[data-snapshot-id="' +
          snapshot.id +
          '"] .snapshot-preview';
        const previewContainer = this.container.querySelector(selector);
        if (!previewContainer) {
          return;
        }
        const image = this.getFirstFrameAsImage_(piskel);
        previewContainer.appendChild(image);
      });
  };

  ns.SessionDetails.prototype.getFirstFrameAsImage_ = function (piskel) {
    const frame = pskl.utils.LayerUtils.mergeFrameAt(piskel.getLayers(), 0);
    const wZoom = PREVIEW_SIZE / piskel.width;
    const hZoom = PREVIEW_SIZE / piskel.height;
    const zoom = Math.min(hZoom, wZoom);
    return pskl.utils.FrameUtils.toImage(frame, zoom);
  };

  ns.SessionDetails.prototype.onBackClick_ = function () {
    this.backupsController.back(this);
  };

  ns.SessionDetails.prototype.onContainerClick_ = function (evt) {
    const action = evt.target.dataset.action;
    if (action == 'load' && window.confirm(Constants.CONFIRM_OVERWRITE)) {
      const snapshotId = evt.target.dataset.snapshotId * 1;
      pskl.app.backupService.loadSnapshotById(snapshotId).then(() => {
        $.publish(Events.DIALOG_HIDE);
      });
    }
  };
})();
