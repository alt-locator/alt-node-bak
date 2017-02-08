import {AltStorage} from './alt.storage';
import {Location} from './location';

export class MockStorage extends AltStorage {
  locationsResult: Location[] = [];

  constructor() { super(); }

  getHosts(): Promise<Location[]> {
    return Promise.resolve(this.locationsResult);
  }

  updateHost(location: Location): Promise<boolean> {
    let notFound = true;
    for (let value of this.locationsResult) {
      if (value.name === location.name) {
        value.externalIpAddress = location.externalIpAddress;
        value.localIpAddress = location.localIpAddress;
        value.macAddress = location.macAddress;
        value.ports = location.ports;
        value.timestamp = location.timestamp;
        return Promise.resolve(true);
      }
    }
    this.locationsResult.push(location);
    return Promise.resolve(notFound);
  }

  removeHost(location: Location): Promise<boolean> {
    let origArray = this.locationsResult;
    this.locationsResult =
        origArray.filter(value => { return value.name != location.name; });
    return Promise.resolve(origArray.length != this.locationsResult.length);
  }
}