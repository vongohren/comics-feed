import winston from 'winston'
import 'winston-papertrail';

const DEV = process.env.NODE_ENV !== 'production';

const winstonConsole = new winston.transports.Console({
    prettyPrint: true,
    colorize: 'all',
    silent: false,
    timestamp: false
})

const exceptionHandlers = [winstonConsole]
const transports = [winstonConsole]

if(!DEV) {
    const winstonPapertrail = new winston.transports.Papertrail({
        host: process.env.LOGHOST,
        port: process.env.LOGPORT,
        colorize: true,
        program: process.env.LOGNAME
    })

    winstonPapertrail.on('error', function(err) {
        console.log(err);
    });

    exceptionHandlers.push(winstonPapertrail);
    transports.push(winstonPapertrail);
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

process.on("unhandledRejection", function(reason, promise) {
    LoggerClass.log('error', reason)
});

export default LoggerClass;
