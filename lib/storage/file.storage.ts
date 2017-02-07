import * as fs from 'fs';
import * as path from 'path';

import {config} from '../config';

import {AltStorage} from './alt.storage';
import {Location} from './location';

export class FileStorage extends AltStorage {

  fileName: string;
  locations: Location[];

  constructor() {
    super();

    this.fileName = path.resolve(config.fileName);
  }

  setFileName(fileName: string): void { this.fileName = fileName; }

  getHosts(): Promise<Location[]> {
    return new Promise<Location[]>((resolve, reject) => {
      try {
        this.locations = this.readFile_();
        resolve(this.locations);
      } catch (error) {
        reject(error);
      }
    });
  }

  updateHost(inLocation: Location): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.locations = this.readFile_();
      } catch (error) {
        this.locations = [];
      }
      inLocation.timestamp = new Date().getTime();

      // update the location if existing
      let found = false;
      for (let key in this.locations) {
        let location = this.locations[key];
        if (location.name === inLocation.name) {
          // update each location property
          location.update(inLocation);
          found = true;
        }
      }
      // if not found, add to the array
      if (!found) {
        this.locations.push(inLocation);
      }

      // create the content
      let contents = {};
      for (let key in this.locations) {
        let location = this.locations[key];
        contents[location.name] = location;
      }
      fs.writeFileSync(this.fileName, JSON.stringify(contents, null, 2));
      resolve(true);
    });
  }

  removeHost(inLocation: Location): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.locations = this.readFile_();
        // remove the location if existing
        let found = false;
        for (let key in this.locations) {
          let location = this.locations[key];
          if (location.name === inLocation.name) {
            // splice the index from the array
            let index = this.locations.indexOf(location);
            this.locations.splice(index, 1);

            // create the content
            let contents = {};
            for (let key in this.locations) {
              let location = this.locations[key];
              contents[location.name] = location;
            }
            fs.writeFileSync(this.fileName, JSON.stringify(contents, null, 2));

            // we found it, update the flag
            found = true;
            resolve(found);
          }
        }
        // if not found, resolve false
        if (!found) {
          resolve(found);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  readFile_(): Location[] {
    try {
      let contents = fs.readFileSync(this.fileName).toString();
      let obj = JSON.parse(contents);
      let locations: Location[] = [];
      for (let key of Object.keys(obj)) {
        let location = new Location();
        location.name = obj[key].name;
        location.localIpAddress = obj[key].localIpAddress;
        location.externalIpAddress = obj[key].externalIpAddress;
        location.macAddress = obj[key].macAddress;
        location.ports = obj[key].ports;
        location.timestamp = obj[key].timestamp;
        locations.push(location);
      }
      return locations;
    } catch (error) {
      throw error;
    }
  }
}
