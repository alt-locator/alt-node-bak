import {GetHosts} from '../../../../lib/cli/cmds/gethosts';
import {LogType} from '../../../../lib/logger';

describe('command get hosts', () => {
  it('get hosts', (done) => {
    let args = {
      '_': ['gethosts'],
      'firebase': true,
      'firebase-path': '/test/read/hosts'
    };
    let getHosts = new GetHosts();
    getHosts.logger.logType = LogType.NONE;
    getHosts.args = args;
    getHosts.run().then((locations) => {
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
    });
  });
});
