import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

import {AltService, FileStorage, Location} from '../../lib/shared';
import {config} from '../../lib/config';

describe('file storage service', () => {
  let altService: AltService;
  let fileStorage: FileStorage;
  let fileName = path.resolve('test-file.json');
  let fileData = `{
    "bar": {
      "name": "bar"
    },
    "foo": {
      "name": "foo",
      "localIpAddress": "http://10.0.0.1",
      "externalIpAddress": "http://20.20.20.20",
      "macAddress": "1a:2b:3c:4d",
      "ports": [ 8080 ],
      "timestamp": 1400000000
    }
  }`;

  describe('reading from file', () => {
    beforeEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentionally left blank
      }
      // format file before writing
      fileData = fileData.replace(/ +/g, ' ').replace(/\n/g, '');
      fileData = JSON.stringify(JSON.parse(fileData), null, 2);
      fs.writeFileSync(fileName, fileData);

      // set up storage and service
      fileStorage = new FileStorage();
      fileStorage.setFileName(fileName);
      altService = new AltService(fileStorage);
    });

    afterEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentionally left blank
      }
    });

    it('should get hosts', (done) => {
      altService.getHosts().then((locations) => {
        expect(locations).not.toBeNull();
        expect(locations.length).toEqual(2);

        expect(locations[0].name).toEqual('bar');
        expect(locations[0].localIpAddress).toBeUndefined();
        expect(locations[0].externalIpAddress).toBeUndefined();
        expect(locations[0].macAddress).toBeUndefined();
        expect(locations[0].ports).toBeUndefined();
        expect(locations[0].timestamp).toBeUndefined();

        expect(locations[1].name).toEqual('foo');
        expect(locations[1].localIpAddress).toEqual('http://10.0.0.1');
        expect(locations[1].externalIpAddress).toEqual('http://20.20.20.20');
        expect(locations[1].macAddress).toEqual('1a:2b:3c:4d');
        expect(locations[1].ports).toEqual([8080]);
        expect(locations[1].timestamp).toEqual(1400000000);

        done();
      });
    });
  });

  describe('reading from a non existing file', () => {
    beforeEach(() => {
      // set up storage and service
      let testFailFile = path.resolve('test-fail-file.json');
      fileStorage = new FileStorage();
      fileStorage.setFileName(testFailFile);
      altService = new AltService(fileStorage);
    });

    it('should fail', (done) => {
      altService.getHosts().then(locations => {
        done.fail();
      }).catch(error => {
        expect(error.code).toEqual('ENOENT');
        done();
      });
    });
  });

  describe('writing a new location', () => {
    beforeEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentially left blank
      }
      fileStorage = new FileStorage();
      fileStorage.setFileName(fileName);
      altService = new AltService(fileStorage);
    });

    afterEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentionally left blank
      }
    });

    it('should update host', (done) => {
      let location = new Location('wow');
      location.localIpAddress = 'http://10.0.0.2';
      location.externalIpAddress = 'http://21.21.21.21';
      location.macAddress = 'a1:b2:c3:d4';
      location.ports = [ 8090 ];
      location.timestamp = 1500000000;

      altService.updateHost(location).then(result => {
        expect(result).toBeTruthy();

        let contents = fs.readFileSync(fileName).toString();
        let obj = JSON.parse(contents);
        let keys = Object.keys(obj);
        expect(keys.length).toEqual(1);
        expect(obj['wow'].name).toEqual(location.name);
        expect(obj['wow'].localIpAddress).toEqual(location.localIpAddress);
        expect(obj['wow'].externalIpAddress).toEqual(location.externalIpAddress);
        expect(obj['wow'].macAddress).toEqual(location.macAddress);
        expect(obj['wow'].ports).toEqual(location.ports);
        expect(obj['wow'].timestamp).toEqual(location.timestamp);

        done();
      });
    });
  });

  describe('writing to an existing location', () => {
    beforeEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentially left blank
      }
      // format file before writing
      fileData = fileData.replace(/ +/g, ' ').replace(/\n/g, '');
      fileData = JSON.stringify(JSON.parse(fileData), null, 2);
      fs.writeFileSync(fileName, fileData);

      fileStorage = new FileStorage();
      fileStorage.setFileName(fileName);
      altService = new AltService(fileStorage);
    });

    it('should update the location', (done) => {
      let location = new Location('bar');
      location.localIpAddress = 'http://10.0.0.4';
      location.externalIpAddress = 'http://22.22.22.22';

      altService.updateHost(location).then(result => {
        expect(result).toBeTruthy();
        altService.getHosts().then(locations => {
          expect(locations).not.toBeNull();
          expect(locations.length).toEqual(2);

          expect(locations[0].name).toEqual('bar');
          expect(locations[0].localIpAddress).toEqual('http://10.0.0.4');
          expect(locations[0].externalIpAddress).toEqual('http://22.22.22.22');
          expect(locations[0].macAddress).toBeUndefined();
          expect(locations[0].ports).toBeUndefined();
          expect(locations[0].timestamp).not.toBeUndefined();

          expect(locations[1].name).toEqual('foo');
          done();
        });
      });
    });
  });

  describe('delete location from a file', () => {
    beforeEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentially left blank
      }
      // format file before writing
      fileData = fileData.replace(/ +/g, ' ').replace(/\n/g, '');
      fileData = JSON.stringify(JSON.parse(fileData), null, 2);
      fs.writeFileSync(fileName, fileData);

      fileStorage = new FileStorage();
      fileStorage.setFileName(fileName);
      altService = new AltService(fileStorage);
    });

    afterEach(() => {
      try {
        rimraf.sync(fileName);
      } catch (error) {
        // intentionally left blank
      }
    });

    it('should delete "bar"', (done) => {
      altService.removeHost(new Location('bar')).then(result => {
        expect(result).toBeTruthy();
        altService.getHosts().then(locations => {
          expect(locations.length).toEqual(1);
          expect(locations[0].name).toEqual('foo');
          done();
        });
      }).catch(error => {
        done.fail();
      });
    });
  });

  describe('delete location from a non existing file', () => {
    beforeEach(() => {
      // set up storage and service
      let testFailFile = path.resolve('test-fail-file.json');
      fileStorage = new FileStorage();
      fileStorage.setFileName(testFailFile);
      altService = new AltService(fileStorage);
    });

    it('should fail', (done) => {
      altService.removeHost(new Location('foo')).then(result => {
        done.fail();
      }).catch(error => {
        expect(error.code).toEqual('ENOENT');
        done();
      });
    });
  });
});
