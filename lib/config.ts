import * as os from 'os';

import {Logger} from './logger';

export let config = {
  locationName : process.env['ALT_NAME'] || os.hostname(),
  firebaseHost :
      process.env['ALT_FIREBASE_HOST'] || 'alt-github.firebaseio.com',
  firebasePath : process.env['ALT_FIREBASE_PATH'] || '/hosts',
  fileName : process.env['ALT_FILENAME'] || 'file.json'
}
