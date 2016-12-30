import {config} from '../config';

import {AltStorage} from './alt.storage';
import {Location} from './location';

export class AltService {

  constructor(private altStorage: AltStorage) {}

  getHosts(): Promise<Location[]> { return this.altStorage.getHosts(); }

  updateThis(): Promise<boolean> {
    let location = new Location(config.locationName);
    return Location.macAddress(location).then(location => {
      return Location.localAddress(location).then(location => {
        return Location.externalAddress(location).then(
            location => { return this.updateHost(location); });
      });
    });
  }

  updateHost(location: Location): Promise<boolean> {
    return this.altStorage.updateHost(location);
  }

  removeHost(location: Location): Promise<boolean> {
    return this.altStorage.removeHost(location);
  }
}
