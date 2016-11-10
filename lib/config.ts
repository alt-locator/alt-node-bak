import * as os from 'os';

import {Logger} from './logger';
import {Location, NodeModel} from './tool/location';

export let Config = {
  firebaseHost : process.env['ALT_HOST'] || 'alt-github.firebaseio.com',
  locationName : process.env['ALT_NAME'] || os.hostname()
}

export let CurrNode = new NodeModel(Config.locationName);
