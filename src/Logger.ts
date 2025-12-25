export type LogLevel = "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
  meta?: any;
}

export class Logger {
  private static minLevel: LogLevel = "info";
  private static levelPriority: Record<LogLevel, number> = {
    info: 0,
    warn: 1,
    error: 2,
    fatal: 3
  };

  static setLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private static shouldLog(level: LogLevel) {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  static log(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;
    const entry: LogEntry = {
      time: new Date().toISOString(),
      level,
      message,
      meta
    };
    console.log(JSON.stringify(entry));
    // TODO: можна додати запис у файл або localStorage
  }

  static info(msg: string, meta?: any) { this.log("info", msg, meta); }
  static warn(msg: string, meta?: any) { this.log("warn", msg, meta); }
  static error(msg: string, meta?: any) { this.log("error", msg, meta); }
  static fatal(msg: string, meta?: any) { this.log("fatal", msg, meta); }
}