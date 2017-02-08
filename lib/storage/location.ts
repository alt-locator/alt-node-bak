import * as https from 'https';
import * as os from 'os';

import {Logger} from '../logger';

let logger = new Logger('location');

/**
 * The location model includes network information.
 */
export class Location {

  /**
   * The Local (Internal) IP Address. If your computer is connected to a router
   * with default
   * settings, that router will automatically assign a local IP address to your
   * computer. Your
   * local IP address is hidden from the outside world and used only inside your
   * private network.
   *
   * https://www.h3xed.com/web-and-internet/whats-the-difference-between-external-and-local-ip-addresses
   */
  localIpAddress: string;

  /**
   * The External (Public) IP Address. The Internet Service Provider (ISP)
   * assigns you an external
   * IP address when you connect to the Internet. When your browser requests a
   * webpage, it sends
   * this IP address along with it.
   *
   * https://www.h3xed.com/web-and-internet/whats-the-difference-between-external-and-local-ip-addresses
   */
  externalIpAddress: string;

  /**
   * THe Media Access Control (MAC) Address is a unique identifier assigned to
   * network interfaces
   * for communications at the data link layer of a network segment. MAC
   * addresses are used as a
   * network address for most IEEE 802 network technologies, including Ethernet
   * and Wi-Fi.
   *
   * https://en.wikipedia.org/wiki/MAC_address
   */
  macAddress: string;

  /**
   * The port number is associated with the IP address of the host and protocol
   * type of
   * communication. A port is identified for each address and protocol by a
   * 16-bit number.
   *
   * https://en.wikipedia.org/wiki/Port_(computer_networking)
   */
  ports: number[];

  /**
   * The timestamp when this location was created or updated.
   */
  timestamp: number;

  /**
   * The name to associate with this location.
   */
  name: string;

  constructor(name?: string) { this.name = name; }

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
