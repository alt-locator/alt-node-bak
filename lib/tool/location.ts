import { Config } from '../config';
import { Logger } from '../logger';

import * as os from 'os';
import * as https from 'https';

let logger = new Logger('location');

export class NodeModel {
  localIpAddress: string;
  externalIpAddress: string;
  macAddress: string;
  ports: number[];
  timestamp: number;

  constructor(public name?: string) {
  }
}

export class Location {
  /**
   * Update the node model with the mac address.
   * @param {NodeModel} the node model to be updated
   * @return {Promise<NodeModel>} the node model with the mac address
   */
  static macAddress(node: NodeModel): Promise<NodeModel> {
    return new Promise<NodeModel>((resolve, reject) => {
      let ifaces = os.networkInterfaces();
      for (let ifacePos in ifaces) {
        ifaces[ifacePos].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            logger.debug('mac address:', iface.mac);
            node.macAddress = iface.mac;
            resolve(node);
          }
        });
      }
    });
  }

  /**
   * Update the node model with the local ip address.
   * @param {NodeModel} the node model to be updated
   * @return {Promise<NodeModel>} the node model with the local ip address
   */
  static localAddress(node: NodeModel): Promise<NodeModel> {
    return new Promise<NodeModel>((resolve, reject) => {
      let ifaces = os.networkInterfaces();
      for (let ifacePos in ifaces) {
        ifaces[ifacePos].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
            logger.debug('local ip address:', iface.address);
            node.localIpAddress = iface.address;
            resolve(node);
          }
        });
      }
    });
  }

  /**
   * Update the node model with the external ip address from api.ipify.org
   * @param {NodeModel} the node model to be updated
   * @return {Promise<NodeModel>} the node model with the external ip address
   */
  static externalAddress(node: NodeModel): Promise<NodeModel> {
    return new Promise<NodeModel>((resolve, reject) => {
      let options = {
        host: 'api.ipify.org'
      };
      https.request(options, response => {
        let content = '';
        if (response.statusCode !== 200) {
          reject(null);
        }
        response.on('data', (chunk) => {
          content += chunk;
        });
        response.on('end', () => {
          logger.debug('external ip address:', content);
          node.externalIpAddress = content;
          resolve(node);
        });
      }).end();
    });
  }
}
