import * as minimist from 'minimist';

import {Logger} from '../logger';

import {Option} from './option';

export interface Args { [key: string]: any; }

export abstract class Program {
  options: Option[];
  arg0: string;
  args: Args;
  command: string;
  description: string;
  program: Program;
  callback: () => Promise<any>;
  logger: Logger;

  constructor() {
    this.options = [];
    this.args = {};
  }

  parseArgs(...argv: string[]) {
    this.args = minimist(argv.slice(2), this.getMinimistOptions());
    this.arg0 = this.args['_'][0];
  }

  help(): Promise<any> {
    return new Promise(resolve => {
      this.logger.info('Usage:        ' + this.command + ' [options]');
      this.logger.info('              ' + this.command + ' help');
      this.logger.info('Description:  ' + this.description);
      this.logger.info('');
      for (let opt of this.options) {
        this.logger.info(opt.name + ' ' + opt.description);
      }
      resolve();
    });
  }

  setCallback(callback: () => Promise<any>) { this.callback = callback; }

  run(): Promise<any> {
    if (this.args['_'] && this.args['_'][0] === 'help') {
      return this.help();
    }
    for (let opt in this.options) {
      let option = this.options[opt];
      option.value = this.getValue(option.name, this.args) || option.value;
    }
    return this.callback();
  }

  getOption(key: string): Option {
    for (let opt of this.options) {
      if (opt.name === key) {
        return opt;
      }
    }
    return null;
  }

  getValue(name: string, args: Args): number|boolean|string {
    let keys = Object.keys(args);
    for (let pos = 0; pos < keys.length; pos++) {
      if (keys[pos] === name && args[name]) {
        return args[name];
      }
    }
    return undefined;
  }

  getMinimistOptions(): Args {
    let minimistOptions: Args = {};
    let minimistBoolean: string[] = [];
    let minimistString: string[] = [];
    let minimistNumber: string[] = [];
    let minimistDefault: any = {};
    for (let option of this.options) {
      if (option.type === 'boolean') {
        minimistBoolean.push(option.name);
      } else if (option.type === 'string') {
        minimistString.push(option.name);
      } else if (option.type === 'number') {
        minimistNumber.push(option.name);
      }
      if (typeof option.defaultValue !== 'undefined') {
        minimistDefault[option.name] = option.defaultValue;
      }
    }
    minimistOptions['boolean'] = minimistBoolean;
    minimistOptions['string'] = minimistString;
    minimistOptions['number'] = minimistNumber;
    minimistOptions['default'] = minimistDefault;
    return minimistOptions;
  }
}
