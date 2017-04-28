const winston = require('winston')
require('winston-papertrail').Papertrail;

const colors = {
    error:'red'
}

const winstonPapertrail = new winston.transports.Papertrail({
  host: process.env.LOGHOST,
  port: process.env.LOGPORT,
  colorize: true,
  program: 'comicFeed'
})

const winstonConsole = new winston.transports.Console({
    prettyPrint: true,
    colorize: 'all',
    silent: false,
    timestamp: false
})

winstonConsole.on('error', function(err) {
    console.log('\x1b[31m', err ,'\x1b[0m');
});

const transports = [winstonConsole];
if(!process.env.DEV) {
    transports.push(winstonPapertrail)
}

winston.handleExceptions(transports);
winston.addColors(colors);

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

process.on("unhandledRejection", function(reason, promise) {
    LoggerClass.log('error', reason)
});

module.exports = LoggerClass;
