export const getCurrentTimestamp = () => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
};

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LEVEL_ICONS: Record<LogLevel, string> = {
  DEBUG: "🔍",
  INFO: "ℹ️",
  WARN: "⚠️",
  ERROR: "❌",
};

const log = (level: LogLevel, module: string, message: string, ...args: unknown[]) => {
  if (level === "DEBUG" && process.env.NODE_ENV === "production") return;
  const out = level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;
  out(`${getCurrentTimestamp()} ${LEVEL_ICONS[level]} [${level}] - ${module} - ${message}`, ...args);
};

export const logger = {
  debug: (module: string, message: string, ...args: unknown[]) => log("DEBUG", module, message, ...args),
  info: (module: string, message: string, ...args: unknown[]) => log("INFO", module, message, ...args),
  warn: (module: string, message: string, ...args: unknown[]) => log("WARN", module, message, ...args),
  error: (module: string, message: string, ...args: unknown[]) => log("ERROR", module, message, ...args),
};
