import { Logger } from './logger';
import { NodeModel, Location } from './node/location';

import * as os from 'os';

export let Config = {
  firebaseHost: process.env['ALT_HOST'] || 'alt-github.firebaseio.com',
  locationName: process.env['ALT_NAME'] || os.hostname()
}

export let CurrNode = new NodeModel(Config.locationName);
