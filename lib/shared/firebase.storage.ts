import * as https from 'https';

import {config} from '../config';
import {Logger} from '../logger';

import {AltStorage} from './alt.storage';
import {Location} from './location';

export class FirebaseStorage extends AltStorage {
  logger: Logger;
  firebaseHost: string;
  firebasePath: string;

  constructor() {
    super();
    this.logger = new Logger('firebase');
    this.firebaseHost = config.firebaseHost;
    this.firebasePath = config.firebasePath;
  }

  setFirebasePath(firebasePath: string): void {
    this.firebasePath = firebasePath;
  }

  setFirebaseHost(firebaseHost: string): void {
    this.firebaseHost = firebaseHost;
  }

  getHosts(): Promise<Location[]> {
    return new Promise<Location[]>((resolve, reject) => {
      this.httpsGet_()
          .then((json) => {
            let hosts: Location[] = [];
            let hostsJson = JSON.parse(json);
            for (let hostPos in hostsJson) {
              hosts.push(hostsJson[hostPos] as Location);
            }
            resolve(hosts);
          })
          .catch(error => { reject(error); });
    });
  }

  updateHost(location: Location): Promise<boolean> {
    location.timestamp = new Date().getTime();
    return this.httpsPatch_(location);
  }

  removeHost(location: Location): Promise<boolean> {
    return this.httpsDelete_(location);
  }

  /**
   * The get request for the host or hosts.
   * @param {string?} opt_name If none is provided, get all hosts.
   * @returns {Promise<string>} The get response body.
   */
  httpsGet_(opt_name?: string): Promise<string> {
    let fbPath = this.firebasePath;
    if (opt_name) {
      fbPath = fbPath + '/' + opt_name;
    }
    fbPath += '/.json';
    return new Promise<string>((resolve, reject) => {
      let options = {
        host : this.firebaseHost,
        path : fbPath,
        method : 'GET',
        headers : {'Content-Type' : 'application/json'}
      };
      let request = https.request(options, (response) => {
        let contents = '';
        response.on('data', chunk => { contents += chunk; });
        response.on('end', () => { resolve(contents); });
        response.on('error', error => { reject(error); });
      });
      request.on('error', error => { reject(error); });
      request.end();
    });
  }

  /**
   * Updates the existing host.
   * @param {Location} location The object that will be sent to Firebase to
   * patch.
   */
  httpsPatch_(location: Location): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let fbPath = this.firebasePath + '/' + location.name + '/.json';
      location.timestamp = new Date().getTime();
      let options = {
        host : this.firebaseHost,
        path : fbPath,
        method : 'PATCH',
        headers : {'Content-Type' : 'application/json'}
      };
      let request = https.request(options, (response) => {
        let content = '';
        response.on('data', chunk => { content += chunk; });
        response.on('end', () => {
          this.logger.debug(content);
          resolve(true);
        });
        response.on('error', error => { reject(error); });
      });
      request.write(JSON.stringify(location));
      request.on('error', error => { reject(error); });
      request.end();
    });
  }

  /**
   * Delete the host.
   * @param {Location} location The object that will be deleted from
   * Firebase.
   */
  httpsDelete_(location: Location): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let fbPath = this.firebasePath + '/' + location.name + '/.json';
      location.timestamp = new Date().getTime();
      let options = {
        host : this.firebaseHost,
        path : fbPath,
        method : 'DELETE',
        headers : {'Content-Type' : 'application/json'}
      };
      let request = https.request(options, (response) => {
        let content = '';
        response.on('data', chunk => { content += chunk; });
        response.on('end', () => { resolve(true); });
        response.on('error', error => { reject(error); });
      });
      request.on('error', error => { reject(error); });
      request.end();
    });
  }
}
