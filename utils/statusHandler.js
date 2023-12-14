const error = (statusCode, message, errors) => {
    const error = new Error(message)
    error.statusCode = statusCode
    if(errors) {
        error.data = errors.array()
    }
    throw error
}

const error500 = (err, next) => {
    if(!err.statusCode) {
        err.statusCode = 500
    }
    next(err)
}

const success = (res, statusCode, jsonObject) => {
    res.status(statusCode).json(jsonObject)
}

exports.error = error
exports.success = success
exports.error500 = error500