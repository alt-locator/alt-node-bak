import {Config} from '../config';
import * as os from 'os';
import * as https from 'https';

export class NodeModel {
  name: string;
  localIpAddress: string;
  externalIpAddress: string;
  macAddress: string;
  ports: number[];
}

export class Location {
  /**
   * Update the node model with the mac address.
   * @param {NodeModel} the node model to be updated
   * @return {Promise<NodeModel>} the node model with the mac address
   */
  static getMacAddress(node: NodeModel): Promise<NodeModel> {
    return new Promise<NodeModel>((resolve, reject) => {
      let ifaces = os.networkInterfaces();
      for (let ifacePos in ifaces) {
        ifaces[ifacePos].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
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
  static getLocalAddress(node: NodeModel): Promise<NodeModel> {
    return new Promise<NodeModel>((resolve, reject) => {
      let ifaces = os.networkInterfaces();
      for (let ifacePos in ifaces) {
        ifaces[ifacePos].forEach(iface => {
          if (iface.family === 'IPv4' && !iface.internal) {
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
  static getExternalAddress(node: NodeModel): Promise<NodeModel> {
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
          node.externalIpAddress = content;
          resolve(node);
        });
      }).end();
    });
  }
}
