import * as os from 'os';

import {Logger} from '../logger';
import {FileConfig} from './file_config';
import {FirebaseConfig} from './firebase_config';
import {LocationConfig} from './location_config';

/**
 * The configuration interface defined by other types of configurations.
 */
export interface Config extends FileConfig, FirebaseConfig, LocationConfig { }

/**
 * Configuration instance.
 */
export let config: Config = {
  locationName : process.env['ALT_NAME'] || os.hostname(),
  firebaseHost :
      process.env['ALT_FIREBASE_HOST'] || 'alt-github.firebaseio.com',
  firebasePath : process.env['ALT_FIREBASE_PATH'] || '/hosts',
  fileName : process.env['ALT_FILENAME'] || 'file.json'
};
