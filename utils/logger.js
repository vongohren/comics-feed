const winston = require('winston')
require('winston-papertrail').Papertrail;

const DEV = process.env['npm_lifecycle_event'] === 'dev' ? true : false;

const winstonConsole = new winston.transports.Console()

const exceptionHandlers = [winstonConsole]
const transports = [winstonConsole]

if(!DEV) {
    winstonPapertrail = new winston.transports.Papertrail({
        host: process.env.LOGHOST,
        port: process.env.LOGPORT,
        colorize: true,
        program: 'comicFeed'
    })

    winstonPapertrail.on('error', function(err) {
        console.log(err);
    });

    exceptionHandlers.push(winstonPapertrail);
    transports.push(transports);
}

winston.handleExceptions(exceptionHandlers);

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
