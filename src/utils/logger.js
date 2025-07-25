const winston = require('winston');
const moment = require('moment-timezone');

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss.SSSZ')
        }),
        winston.format.errors({stack: true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'student-management-api' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    ]
})

module.exports = {logger}