(function () {
  const ns = $.namespace('pskl.devtools');

  ns.DrawingTestRunner = function (testName) {
    this.testName = testName;
    $.subscribe(Events.TEST_RECORD_END, this.onTestRecordEnd_.bind(this));
  };

  ns.DrawingTestRunner.prototype.start = function () {
    pskl.utils.Xhr.get(
      this.testName,
      (response) => {
        const res = response.responseText;
        const recordPlayer = new ns.DrawingTestPlayer(JSON.parse(res));
        recordPlayer.start();
      });
  };

  ns.DrawingTestRunner.prototype.onTestRecordEnd_ = function (evt, success) {
    const testResult = document.createElement('div');
    testResult.id = 'drawing-test-result';
    testResult.setAttribute('data-test-name', this.testName);
    testResult.setAttribute('data-testid', 'drawing-test-result');
    testResult.innerHTML = success ? 'OK' : 'KO';
    document.body.appendChild(testResult);
  };
})();
