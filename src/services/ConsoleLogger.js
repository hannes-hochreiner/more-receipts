export default class ConsoleLogger {
  constructor(ps) {
    this._ps = ps;

    this._ps.subscribe('sys', this._log.bind(this));
  }

  _log(topic, data) {
    // eslint-disable-next-line
    console.log(`${(new Date).toISOString()}: ${topic} ${JSON.stringify(data)}`);
  }
}