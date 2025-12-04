(function () {
  const ns = $.namespace('pskl.controller');
  const SHOW_MORE_CLASS = 'show-more';

  ns.TransformationsController = function () {
    this.tools = [
      new pskl.tools.transform.Flip(),
      new pskl.tools.transform.Rotate(),
      new pskl.tools.transform.Clone(),
      new pskl.tools.transform.Center(),
      new pskl.tools.transform.Crop()
    ];

    this.toolIconBuilder = new pskl.tools.ToolIconBuilder();
  };

  ns.TransformationsController.prototype.init = function () {
    this.container = document.querySelector('.transformations-container');
    this.container.addEventListener(
      'click',
      this.onTransformationClick_.bind(this));
    this.showMoreLink = this.container.querySelector(
      '.transformations-show-more-link');
    this.showMoreLink.addEventListener(
      'click',
      this.toggleShowMoreTools_.bind(this));
    this.createToolsDom_();
    this.updateShowMoreLink_();

    $.subscribe(
      Events.USER_SETTINGS_CHANGED,
      this.onUserSettingsChange_.bind(this));
  };

  ns.TransformationsController.prototype.applyTool = function (toolId, evt) {
    this.tools.forEach(
      (tool) => {
        if (tool.toolId === toolId) {
          $.publish(Events.TRANSFORMATION_EVENT, [toolId, evt]);
          tool.applyTransformation(evt);
        }
      });
  };

  ns.TransformationsController.prototype.onTransformationClick_ = function (
    evt
  ) {
    const toolId = evt.target.dataset.toolId;
    if (toolId) {
      this.applyTool(toolId, evt);
    }
  };

  ns.TransformationsController.prototype.toggleShowMoreTools_ = function (evt) {
    const showMore = pskl.UserSettings.get(pskl.UserSettings.TRANSFORM_SHOW_MORE);
    pskl.UserSettings.set(pskl.UserSettings.TRANSFORM_SHOW_MORE, !showMore);
  };

  ns.TransformationsController.prototype.onUserSettingsChange_ = function (
    evt,
    settingName
  ) {
    if (settingName == pskl.UserSettings.TRANSFORM_SHOW_MORE) {
      this.updateShowMoreLink_();
    }
  };

  ns.TransformationsController.prototype.updateShowMoreLink_ = function () {
    const showMoreEnabled = pskl.UserSettings.get(
      pskl.UserSettings.TRANSFORM_SHOW_MORE);
    this.container.classList.toggle(SHOW_MORE_CLASS, showMoreEnabled);

    // Hide the link in case there are 4 or less tools available.
    this.showMoreLink.classList.toggle('hidden', this.tools.length < 5);
  };

  ns.TransformationsController.prototype.createToolsDom_ = function () {
    const html = this.tools.reduce(
      (p, tool) => {
        return p + this.toolIconBuilder.createIcon(tool, 'left');
      },
      '');
    const toolsContainer = this.container.querySelector('.tools-wrapper');
    toolsContainer.innerHTML = html;
  };
})();
