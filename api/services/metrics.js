var metricador = require('metricador');

var metricRegistry = metricador.registry;
var metricPublishers = [
  metricador.publishers.console.json.get(metricRegistry),
];
var metricReporter = new metricador.Reporter(metricPublishers);
var socketCounter = metricRegistry.counter('shoutbox.socket.opened');

module.exports = {
  socketConnect() {
    socketCounter.incrementAndGet();
  },
  socketDisconnect() {
    socketCounter.decrementAndGet();
  }
};