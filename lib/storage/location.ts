import * as https from 'https';
import * as os from 'os';

import {Logger} from '../logger';

let logger = new Logger('location');

export class Location {
  localIpAddress: string;
  externalIpAddress: string;
  macAddress: string;
  ports: number[];
  timestamp: number;

  constructor(public name?: string) {}

  update(location: Location) {
    this.localIpAddress = location.localIpAddress || this.localIpAddress;
    this.externalIpAddress =
        location.externalIpAddress || this.externalIpAddress;
    this.macAddress = location.macAddress || this.macAddress;
    this.ports = location.ports || this.ports;
    this.timestamp = location.timestamp || this.timestamp;
  }

  /**
   * Update the Location model with the mac address.
   * @param {Location} the location model to be updated
   * @return {Promise<Location>} the location model with the mac address
   */
  static macAddress(location: Location): Promise<Location> {
    return new Promise<Location>((resolve, reject) => {
      let ifaces = os.networkInterfaces();
      for (let ifacePos in ifaces) {
        ifaces[ifacePos].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            logger.debug('mac address:', iface.mac);
            location.macAddress = iface.mac;
            resolve(location);
          }
        });
      }
    });
  }

  /**
   * Update the Location model with the local ip address.
   * @param {Location} the location model to be updated
   * @return {Promise<Location>} the location model with the local ip address
   */
  static localAddress(location: Location): Promise<Location> {
    return new Promise<Location>((resolve, reject) => {
      let ifaces = os.networkInterfaces();
      for (let ifacePos in ifaces) {
        ifaces[ifacePos].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            logger.debug('local ip address:', iface.address);
            location.localIpAddress = iface.address;
            resolve(location);
          }
        });
      }
    });
  }

  /**
   * Update the Location model with the external ip address from api.ipify.org
   * @param {Location} the location model to be updated
   * @return {Promise<Location>} the location model with the external ip address
   */
  static externalAddress(location: Location): Promise<Location> {
    return new Promise<Location>((resolve, reject) => {
      let options = {host : 'api.ipify.org'};
      https
          .request(options,
                   response => {
                     let content = '';
                     if (response.statusCode !== 200) {
                       reject(null);
                     }
                     response.on('data', (chunk) => { content += chunk; });
                     response.on('end', () => {
                       logger.debug('external ip address:', content);
                       location.externalIpAddress = content;
                       resolve(location);
                     });
                   })
          .end();
    });
  }
}
