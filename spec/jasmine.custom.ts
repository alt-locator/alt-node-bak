import {Location} from './../lib/storage';

/**
 * The result interface for jasmine custom matchers
 */
interface Result {
  pass: boolean;
  message?: string;
}

/**
 * The callback for comparing host values. If any of these are errors, print an error message.
 */
let compareHosts = (actual: Location, expected: Location): Result  => {
  let result: Result = {
    pass: true
  };
  let messages = [];
  if (actual.name !== expected.name) {
    messages.push(actual.name + ' to equal ' + expected.name);
  }
  if (actual.externalIpAddress !== expected.externalIpAddress) {
    messages.push(actual.externalIpAddress + ' to equal ' + expected.externalIpAddress);
  }
  if (actual.localIpAddress !== expected.localIpAddress) {
    messages.push(actual.localIpAddress + ' to equal ' + expected.localIpAddress);
  }
  if (actual.macAddress !== expected.macAddress) {
    messages.push(actual.macAddress !== expected.macAddress);
  }
  if (actual.ports !== expected.ports) {
    messages.push('[' + actual.ports.join(',') + '] to equal [' + expected.ports.join(',') + ']');
  }
  if (actual.timestamp !== expected.timestamp) {
    messages.push(actual.timestamp + ' to equal ' + expected.timestamp);
  }

  result.pass = messages.length === 0;
  result.message = messages.join('\n');
  return result;
};

/**
 * The custom matcher method with a callback to compare hosts
 */
export let toBeHost = () => {
  return {
    compare: compareHosts
  };
};