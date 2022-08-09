export type ErrorMessage = { errorMessage: string }

const getFormat = (num: number, length: number = 2): string => num.toString().padStart(length, '0')
export type Log = { message: string, data?: any }

const getTimezone = (offset: number) => {
    const t1 = Math.abs(offset / 60)
    const hrs = Math.floor(t1)
    const mins = (t1 - hrs) * 60
    const offsetSymbol = offset < 0 ? '+' : '-'
    return `${offsetSymbol}${getFormat(hrs)}${getFormat(mins)}`
}

const getTimestamp = (): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const time = `${[getFormat(now.getHours()),
        getFormat(now.getMinutes()),
        getFormat(now.getSeconds())].join(':')}.${getFormat(now.getMilliseconds(), 3)}`
    const timezone = getTimezone(now.getTimezoneOffset())
    return `${year}-${getFormat(month)}-${getFormat(date)}T${time}${timezone}`
}

const logger = {
    errorResponse(customError: ErrorMessage) {
        try {
            const timestamp = getTimestamp()
            console.log(JSON.stringify({
                timestamp,
                level: 'ERROR',
                details: {customError}
            }))
        } catch (newError) {
            console.log(newError, 'Error while logging ERROR log')
        }
    },
    info(log: Log) {
        console.log(JSON.stringify({
            timestamp: getTimestamp(),
            level: "INFO",
            details: log
        }))
    },
    error(log: Log) {
        console.log(JSON.stringify({
            timestamp: getTimestamp(),
            level: "ERROR",
            details: log
        }))
    }
}

export default logger