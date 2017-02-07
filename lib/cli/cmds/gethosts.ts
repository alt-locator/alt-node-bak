import {Logger} from '../../logger';
import {AltService, AltStorage, FirebaseStorage} from '../../storage';
import {Option} from '../option';
import {Args, Program} from '../program';

import {FIREBASE, FIREBASE_PATH, options} from './opts';

export class GetHosts extends Program {
  altService: AltService;
  logger = new Logger('get_hosts', false, false);

  constructor() {
    super();
    this.command = 'gethosts';
    this.description = 'prints to console the list of hosts';
    this.setCallback(this.getHosts);
    this.options.push(options.firebase);
    this.options.push(options.firebasePath);
    this.setCallback(this.getHosts);
  }

  getHosts(): Promise<any> {
    let storage: AltStorage;
    if (this.getOption(FIREBASE).getBoolean()) {
      storage = new FirebaseStorage();

      if (this.getOption(FIREBASE_PATH).getString()) {
        (storage as FirebaseStorage)
            .setFirebasePath(this.getOption(FIREBASE_PATH).getString());
      }
    }
    this.altService = new AltService(storage);
    return this.altService.getHosts().then(locations => {
      for (let location of locations) {
        this.logger.info(location.name + ' - ' +
                         'local: ' + location.localIpAddress + ', ' +
                         'external: ' + location.externalIpAddress);
      }
      return locations;
    });
  }
}
