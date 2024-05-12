handler = {}

handler.notFoundHandler = (requestProperties, callBack) => {
    callBack(404, {
        message: 'requested url not found'
    })
}

module.exports = handler