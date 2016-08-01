import * as os from 'os';
import {Logger, LogLevel} from 'top-banana-logger';
import {NodeModel, Location} from './node/location';
Logger.logLevel = LogLevel.DEBUG;

export let Config = {
  firebaseHost: 'alt-github.firebaseio.com',
  locationName: os.hostname()
}

export let CurrNode = new NodeModel(Config.locationName);
