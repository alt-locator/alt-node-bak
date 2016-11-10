import * as https from 'https';

import {Config, CurrNode} from '../config';
import {Logger} from '../logger';

import {Location, NodeModel} from './location';

let logger = new Logger('alt.service');

/**
 * The Alt Firebase Service interacts with the Alt Firebase APIs.
 */
export class AltFirebaseService {
  /**
   * Get the list of hosts from firebase.
   * @return {Promise<NodeObject[]} List of nodes
   */
  static getHosts(): Promise<NodeModel[]> {
    return new Promise<NodeModel[]>((resolve, reject) => {
      AltFirebaseClient.get().then((json) => {
        let hosts: NodeModel[] = [];
        let hostsJson = JSON.parse(json);
        for (let hostPos in hostsJson) {
          hosts.push(hostsJson[hostPos]);
        }
        resolve(hosts);
      });
    });
  }

  /**
   * Updates this host with this location.
   * @return {Promise<boolean>} If the host encounters an error, return false
   */
  static updateThis(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      CurrNode.timestamp = new Date().getTime();
      Location.macAddress(CurrNode)
          .then(node => Location.localAddress(node))
          .then(node => Location.externalAddress(node))
          .then(node => {
            AltFirebaseClient.patch(node).then(results => {
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

  /**
   * Update a location.
   * @param {NodeModel} nodeModel
   * @returns {Promise<boolean>} Status of location updated.
   */
  static updateLocation(nodeModel: NodeModel): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      nodeModel.timestamp = new Date().getTime();
      AltFirebaseClient.patch(nodeModel).then(status => { return status; });
    });
  }

  /**
   * Update all local ip addresses.
   * @returns Promise<Promise<boolean>[]> Array of booleans.
   */
  static updateAllLocal(): Promise<Promise<boolean>[]> {
    let promises: Promise<boolean>[] = [];
    AltFirebaseService.getHosts().then(nodeObjects => {
      for (let pos in nodeObjects) {
        let nodeObject = nodeObjects[pos];
        if (CurrNode.externalIpAddress === nodeObject.externalIpAddress &&
            CurrNode.localIpAddress !== nodeObject.localIpAddress) {
          promises.push(new Promise<boolean>((resolve, reject) => {
            let options = {
              host : nodeObject.localIpAddress,
              path : '/patch',
              port : 3000
            };
            https
                .request(options,
                         response => {
                           let contents = '';
                           response.on('data',
                                       (chunk) => { contents += chunk; });
                           response.on('end', () => {
                             logger.debug(contents);
                             resolve(true);
                           });
                           response.on('error', () => { reject(false); });
                         })
                .end();
          }));
        }
      }
    });
    return Promise.all(promises);
  }
}

/**
 * The Alt Firebase Client consists of the basic rest API interface.
 */
export class AltFirebaseClient {
  /**
   * The get request for the host or hosts.
   * @param {string?} opt_name If none is provided, get all hosts.
   * @returns {Promise<string>} The get response body.
   */
  static get(opt_name?: string): Promise<string> {
    let path = '/hosts';
    if (opt_name) {
      path += '/' + opt_name;
    }
    path += '.json';
    let promise = new Promise<any>((resolve, reject) => {
      let options = {
        host : Config.firebaseHost,
        path : path,
        method : 'GET',
        headers : {'Content-Type' : 'application/json'}
      };
      let request = https.request(options, (response) => {
        let contents = '';
        response.on('data', (chunk) => { contents += chunk; });
        response.on('end', () => { resolve(contents); });
      });
      request.end();
    });
    return promise;
  }

  /**
   * Updates the existing host.
   * @param {NodeObject} node The object that will be sent to Firebase to patch.
   */
  static patch(node: NodeModel): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      node.timestamp = new Date().getTime();
      let options = {
        host : Config.firebaseHost,
        path : '/hosts/' + node.name + '/.json',
        method : 'PATCH',
        headers : {'Content-Type' : 'application/json'}
      };
      let request = https.request(options, (response) => {
        let content = '';
        response.on('data', (chunk) => { content += chunk; });
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
