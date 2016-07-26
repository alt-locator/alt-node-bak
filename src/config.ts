import {Logger, LogLevel} from 'top-banana-logger';
import {NodeModel, Location} from './node/location';
Logger.logLevel = LogLevel.DEBUG;

export let Config = {
  firebaseHost: 'alternative-4ae3a.firebaseio.com',
  locationName: 'hp-laptop'
}

export let CurrNode = new NodeModel(Config.locationName);
