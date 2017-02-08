
import {Location, MockStorage} from '../../../lib/storage';
import {toBeHost} from '../../jasmine.custom';

describe('mock storage', () => {
  let location0: Location;
  let location1: Location;
  let locations: Location[];
  let mockStorage: MockStorage;

  // Add custom matchers.
  beforeEach(() => {
    jasmine.addMatchers({
      toBeHost: toBeHost
    });
  });

  //Initialize values for the mock locations.
  beforeEach(() => {
    location0 = new Location();
    location0.name = 'foo';
    location0.externalIpAddress = '10.0.0.10';
    location0.localIpAddress = '192.168.0.1';
    location0.macAddress = 'a1:b2:c3:d4';
    location0.ports = [ 8080 ];
    location0.timestamp = 1486573510;

    location1 = new Location();
    location1.name = 'bar';
    location1.externalIpAddress = '10.0.0.10';
    location1.localIpAddress = '192.168.0.2';
    location1.macAddress = '1a:2b:3c:4d';
    location1.ports = [ 8090 ];
    location1.timestamp = 1486573520;

    locations = [];
    locations.push(location0);
    locations.push(location1);

    mockStorage = new MockStorage();
    mockStorage.locationsResult = locations;
  });

  it('should get hosts', done => {
    mockStorage.getHosts().then(hosts => {
      expect(hosts.length).toEqual(2);
      expect(hosts[0]).toBeHost(location0);
      expect(hosts[1]).toBeHost(location1);
      done();
    }).catch(err => {
      done.fail(err);
    });
  });

  it('should remove a host', done => {
    mockStorage.removeHost(location1).then(result => {
      expect(result).toBeTruthy();
      mockStorage.getHosts().then(hosts => {
        expect(hosts.length).toEqual(1);
        expect(hosts[0]).toBeHost(location0);
        done();
      });
    }).catch(err => {
      done.fail(err);
    });;
  });

  it('should add a host', done => {
    let location2 = new Location();
    location2.name = 'baz';
    location2.externalIpAddress = '11.11.11.11';
    location2.localIpAddress = '192.168.0.3';
    location2.macAddress = 'teh:mac:add';
    location2.ports = [];
    location2.timestamp = 0;

    mockStorage.updateHost(location2).then(result => {
      expect(result).toBeTruthy();
      mockStorage.getHosts().then(hosts => {
        expect(hosts.length).toEqual(3);
        expect(hosts[0]).toBeHost(location0);
        expect(hosts[1]).toBeHost(location1);
        expect(hosts[2]).toBeHost(location2);
        done();
      });
    }).catch(err => {
      done.fail(err);
    });
  });

  it('should update an existing host', done => {
    location1.externalIpAddress = '11.11.11.11';
    location1.localIpAddress = '192.168.1.1';
    location1.timestamp = 0;
    mockStorage.updateHost(location1).then(result => {
      expect(result).toBeTruthy();
      mockStorage.getHosts().then(hosts => {
        expect(hosts.length).toEqual(2);
        expect(hosts[0]).toBeHost(location0);
        expect(hosts[1]).toBeHost(location1);
        done();
      });
    }).catch(err => {
      done.fail(err);
    });
  });
});