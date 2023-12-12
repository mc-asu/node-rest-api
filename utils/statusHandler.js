const error = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    throw error
}

const error500 = (err, next) => {
    if(!err.statusCode) {
        err.statusCode = 500
    }
    next(err)
}

const success = (res, statusCode, message, result, name) => {
    const statusJson = {}
    statusJson.message = message
    if(name && result) {
        statusJson[name] = result
    } 
    res.status(statusCode).json(statusJson)
}

exports.error = error
exports.success = success
exports.error500 = error500