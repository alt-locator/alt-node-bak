export enum LogType {
  CONSOLE
}

export enum LogLevel {
  INFO,
  DEBUG,
  WARN,
  ERROR
}

export class Logger {

  constructor(private name_: string,
              private logType_: LogType = LogType.CONSOLE,
              private useTimestamp_: boolean = true,
              private useChalk_: boolean = false) {}

  info(...args: any[]) { this.log(LogLevel.INFO, args); }

  debug(...args: any[]) { this.log(LogLevel.DEBUG, args); }

  warn(...args: any[]) { this.log(LogLevel.WARN, args); }

  error(...args: any[]) { this.log(LogLevel.ERROR, args); }

  dateTime(): string { return new Date().toTimeString(); }

  log(logLevel: LogLevel, args: any[]) {
    let tags = '';
    if (this.useTimestamp_) {
      tags += '[' + this.dateTime() + '] ';
    }

    switch (logLevel) {
    case LogLevel.INFO:
      tags += 'I/';
      break;
    case LogLevel.DEBUG:
      tags += 'D/';
      break;
    case LogLevel.WARN:
      tags += 'W/';
      break;
    case LogLevel.ERROR:
      tags += 'E/';
      break;
    }
    tags += this.name_;

    switch (this.logType_) {
    case LogType.CONSOLE:
      this.infoConsole(tags, args);
      break;
    }
  }

  infoConsole(tags: string, args: any[]) {
    args.unshift(tags);
    console.log.apply(console, args);
  }

  debugConsole(tags: string, args: any) { console.debug(tags, args); }

  warnConsole(tags: string, args: any) { console.warn(tags, args); }

  errorConsole(tags: string, args: any) { console.error(tags, args); }
}
