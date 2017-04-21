const winston = require('winston')
require('winston-papertrail').Papertrail;

const winstonPapertrail = new winston.transports.Papertrail({
  host: process.env.LOGHOST,
  port: process.env.LOGPORT,
  colorize: true,
  program: 'comicFeed'
})

const winstonConsole = new winston.transports.Console()

winstonPapertrail.on('error', function(err) {
    console.log(err);
});

const transports = [winstonConsole];
if(!process.env.DEV_LOGGING) {
    transports.push(winstonPapertrail)
}

winston.handleExceptions(transports);

class Logger {
    constructor() {
        this.mainLogger = new winston.Logger({
          transports: transports
        });
    }

    log(level, message) {
        this.mainLogger[level](message);
    }

    close() {
        this.mainLogger.close()
    }
}

const LoggerClass = new Logger();

module.exports = LoggerClass;
