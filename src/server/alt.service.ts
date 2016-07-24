import {Logger} from 'top-banana-logger';
import {Location, NodeModel} from '../node/location';
import {Config} from '../config';
import * as https from 'https';

let logger = new Logger('alt.service');

/**
 * The basic node body for the API with the last time it was updated. If it
 * nothing has changed, maintain the timestamp.
 */
export class NodeObject extends NodeModel {
  timestamp: number;
}

/**
 * The Alt Firebase Service interacts with the Alt Firebase APIs.
 */
export class AltFirebaseService {

  /**
   * get the list of hosts from firebase
   * @return {Promise<NodeObject[]} list of nodes
   */
  static getHosts(): Promise<NodeObject[]> {
    return new Promise<NodeObject[]>((resolve, reject) => {
      AltFirebaseClient.get().then((json) => {
        let hosts: NodeObject[] = []  ;
        let hostsJson = JSON.parse(json);
        for (let hostPos in hostsJson) {
          hosts.push(hostsJson[hostPos]);
        }
        resolve(hosts);
      });
    });
  }

  /**
   * Updates a host with this location
   * @param {string} name of the host
   * @return {Promise<boolean>} if the host encounters an error, return false
   */
  static updateHost(name: string): Promise<boolean> {
    // update the host information and perform a patch
    return new Promise<boolean>((resolve, reject) => {
      let node = new NodeModel();
      node.name = name;
      Location.getMacAddress(node)
        .then(node => Location.getLocalAddress(node))
        .then(node => Location.getExternalAddress(node))
        .then(node => {
          AltFirebaseClient.patch(node as NodeObject).then(results => {
            if (results) {
              resolve(true);
            } else {
              reject(false);
            }
          });
        })
        .catch(err => reject(false));
    });
  }
}

/**
 * The Alt Firebase Client consists of the basic rest API interface.
 */
export class AltFirebaseClient {

  /**
   * The get request for the host or hosts
   * @param {string?} optional host name param
   * @return {Promise<string>} the get response body
   */
  static get(opt_name?: string): Promise<string> {
    let path = '/hosts';
    if (opt_name) {
      path += '/' + opt_name;
    }
    path += '.json';
    let promise = new Promise<any>((resolve, reject) => {
      let options = {
        host: Config.firebaseHost,
        path: path,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
      let request = https.request(options, (response) => {
        let contents = '';
        response.on('data', (chunk) => {
          contents += chunk;
        });
        response.on('end', () => {
          resolve(contents);
        });
      });
      request.end();
    });
    return promise;
  }

  /**
   * Updates the existing host
   * @param {NodeObject} The object that will be sent to Firebase to patch
   */
  static patch(node: NodeObject): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      node.timestamp = new Date().getTime();
      let options = {
        host: Config.firebaseHost,
        path: '/hosts/' + node.name + '/.json',
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      let request = https.request(options, (response) => {
        let content = '';
        response.on('data', (chunk) => {
          content += chunk;
        });
        response.on('end', () => {
          logger.debug(content);
          resolve(true);
        });
      });
      request.write(JSON.stringify(node));
      request.end();
    });
  }
}
