var metricador = require('metricador');
var util = require('util');

var metricRegistry = metricador.registry;
var metricPublishers = [metricador.publishers.console.json.get(metricRegistry)];
var metricReporter = new metricador.Reporter(metricPublishers);
var socketCounter = metricRegistry.counter(sails.config.appname + '.socket.opened');

function constructMetricName(path, method) {
  return util.format('%s.path.%s.method.%s.responseTime', sails.config.appname, path.replace(/\d+/gm, ':id'), method);
}

module.exports = {
  init() {
    if (!metricReporter.isRunning()) {
      metricReporter.start();
    }
  },
  socketConnect() {
    socketCounter.incrementAndGet();
  },
  socketDisconnect() {
    socketCounter.decrementAndGet();
  },
  updatePathMetric(path, method, time) {
    var histogram = metricador.registry.histogram(constructMetricName(path, method));
    histogram.update(time);
  }
};