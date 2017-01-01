export enum LogType {
  CONSOLE,
  NONE
}

export enum LogLevel {
  INFO,
  DEBUG,
  WARN,
  ERROR
}

export class Logger {
  constructor(public name_: string, public useTimestamp_: boolean = true,
              public useLogLevel_: boolean = true,
              public logType: LogType = LogType.CONSOLE,
              public useChalk_: boolean = false) {}

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

    if (this.useLogLevel_) {
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
    }

    switch (this.logType) {
    case LogType.CONSOLE:
      this.infoConsole(tags, args);
      break;
    case LogType.NONE:
      break;
    }
  }

  infoConsole(tags: string, args: any[]) {
    if (tags !== '') {
      args.unshift(tags);
    }
    console.log.apply(console, args);
  }

  debugConsole(tags: string, args: any) { console.debug(tags, args); }

  warnConsole(tags: string, args: any) { console.warn(tags, args); }

  errorConsole(tags: string, args: any) { console.error(tags, args); }
}
