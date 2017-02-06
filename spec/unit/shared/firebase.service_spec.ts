import {AltService, FirebaseStorage, Location} from '../../../lib/shared';
import {config} from '../../../lib/config';
import {LogType} from '../../../lib/logger';

describe('firebase storage service', () => {
  let altService: AltService;
  let firebaseStorage: FirebaseStorage;
  let firebasePath: string;

  describe('reading from db', () => {
    beforeEach(() => {
      firebasePath = '/test/read/hosts';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebasePath(firebasePath);
      altService = new AltService(firebaseStorage);
    });

    it('should get hosts', (done) => {
      altService.getHosts().then(locations => {
        expect(locations).not.toBeNull();
        expect(locations.length).toEqual(2);

        expect(locations[0].name).toEqual('bar');
        expect(locations[0].localIpAddress).toBeUndefined();
        expect(locations[0].externalIpAddress).toBeUndefined();
        expect(locations[0].macAddress).toBeUndefined();
        expect(locations[0].ports).toBeUndefined();
        expect(locations[0].timestamp).toEqual(1500000000);

        expect(locations[1].name).toEqual('foo');
        expect(locations[1].localIpAddress).toEqual('http://10.0.0.1');
        expect(locations[1].externalIpAddress).toEqual('http://20.20.20.20');
        expect(locations[1].macAddress).toEqual('1a:2b:3c:4d');
        expect(locations[1].ports).toEqual([8080]);
        expect(locations[1].timestamp).toEqual(1400000000);

        done();
      }).catch(error => {
        done.fail();
      });
    });
  });

  describe('reading from a non existing db', () => {
    beforeEach(() => {
      let firebaseHost = 'https://foobar.com';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebaseHost(firebaseHost);
      altService = new AltService(firebaseStorage);
    });

    it('should fail on request with ENOTFOUND', (done) => {
      altService.getHosts().then(locations => {
        done.fail();
      }).catch(error => {
        expect(error.code).toEqual('ENOTFOUND');
        done();
      });
    });
  });

  describe('reading from an empty db', () => {
    beforeEach(() => {
      firebasePath = '/test/read/empty';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebasePath(firebasePath);
      altService = new AltService(firebaseStorage);
    });

    it('should get an empty array', (done) => {
      altService.getHosts().then(locations => {
        expect(locations).not.toBeNull();
        expect(locations.length).toEqual(0);
        done();
      }).catch(error => {
        done.fail();
      });
    });
  });

  /**
   * Always update existing "wow" entry.
   * https://alt-github.firebaseio.com/test/write/hosts/wow/.json
   * {
   *   "externalIpAddress": "http://21.21.21.21",
   *   "localIpAddress": "http://10.0.0.2",
   *   "macAddress": "a1:b2:c3:d4",
   *   "name": "wow",
   *   "ports": [ 8080 ],
   *   "timestamp": { some timestamp }
   * }
   *
   * Always write a new "zoo" entry.
   * https://alt-github.firebaseio.com/test/write/hosts/zoo/.json
   * {
   *   "externalIpAddress": "http://22.22.22.22",
   *   "localIpAddress": "http://10.0.0.3",
   *   "macAddress": "1a:2b:3c:4d",
   *   "name": "zoo",
   *   "ports": [ 8090 ],
   *   "timestamp": { some timestamp }
   * }
   */
  describe('writing to an existing location', () => {
    beforeEach(() => {
      firebasePath = '/test/write/hosts';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebasePath(firebasePath);
      altService = new AltService(firebaseStorage);
    });

    afterEach((done) => {
      altService.removeHost(new Location('zoo')).then(result => {
        done();
      });
    });

    it('should update', (done) => {
      let location = new Location('wow');
      altService.updateHost(location).then(result => {
        expect(result).toBe(true);
        done();
      }).catch(error => {
        done.fail();
      });
    });
  });

  describe('writing a new location', () => {
    beforeEach(() => {
      firebasePath = '/test/write/hosts';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebasePath(firebasePath);
      altService = new AltService(firebaseStorage);
    });

    afterEach((done) => {
      altService.removeHost(new Location('zoo')).then(result => {
        done();
      });
    });

    it('should update', (done) => {
      let location = new Location('zoo');
      location.externalIpAddress = 'http://22.22.22.22';
      location.localIpAddress = 'http://10.0.0.3';
      location.macAddress = '1a:2b:3c:4d';
      location.ports = [ 8090 ];

      altService.updateHost(location).then(result => {
        expect(result).toBeTruthy();

        altService.getHosts().then(locations => {
          expect(locations).not.toBeNull();
          expect(locations.length).toEqual(2);

          expect(locations[0].name).toEqual('wow');
          expect(locations[0].externalIpAddress).toEqual('http://21.21.21.21');
          expect(locations[0].localIpAddress).toEqual('http://10.0.0.2');
          expect(locations[0].macAddress).toEqual('a1:b2:c3:d4');
          expect(locations[0].ports.length).toEqual(1);
          expect(locations[0].ports[0]).toEqual(8080);

          expect(locations[1].name).toEqual('zoo');
          expect(locations[1].externalIpAddress).toEqual('http://22.22.22.22');
          expect(locations[1].localIpAddress).toEqual('http://10.0.0.3');
          expect(locations[1].macAddress).toEqual('1a:2b:3c:4d');
          expect(locations[1].ports.length).toEqual(1);
          expect(locations[1].ports[0]).toEqual(8090);

          done();
        }).catch(error => {
          done.fail();
        });
      });
    });
  });

  describe('writing to a non existing db', () => {
    beforeEach(() => {
      let firebaseHost = 'https://foobar.com';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebaseHost(firebaseHost);
      altService = new AltService(firebaseStorage);
    });

    it('should fail on request with ENOTFOUND', (done) => {
      let location = new Location('boo');
      altService.updateHost(location).then(locations => {
        done.fail();
      }).catch(error => {
        expect(error.code).toEqual('ENOTFOUND');
        done();
      });
    });
  });

  describe('delete from db', () => {
    beforeEach((done) => {
      firebasePath = '/test/delete/hosts';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebasePath(firebasePath);
      altService = new AltService(firebaseStorage);

      altService.updateHost(new Location('del')).then(() => {
        done();
      });
    });

    it('successfully remove entry', (done) => {
      altService.removeHost(new Location('del')).then(result => {
        expect(result).toBeTruthy();
        done();
      }).catch(error => {
        done.fail();
      });
    });
  });

  describe('delete from a non-exist location', () => {
    beforeEach(() => {
      firebasePath = '/test/delete/hosts';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebasePath(firebasePath);
      altService = new AltService(firebaseStorage);
    });

    it('should remove the entry', (done) => {
      altService.removeHost(new Location('pop')).then(result => {
        expect(result).toBeTruthy();
        done();
      }).catch(error => {
        done.fail();
      });
    });
  });

  describe('delete from a non existing db', () => {
    beforeEach(() => {
      let firebaseHost = 'https://foobar.com';
      firebaseStorage = new FirebaseStorage();
      firebaseStorage.logger.logType = LogType.NONE;
      firebaseStorage.setFirebaseHost(firebaseHost);
      altService = new AltService(firebaseStorage);
    });

    it('should reject the request', (done) => {
      altService.removeHost(new Location('pop')).then(result => {
        done.fail();
      }).catch(error => {
        expect(error.code).toEqual('ENOTFOUND');
        done();
      });
    });
  });
});
