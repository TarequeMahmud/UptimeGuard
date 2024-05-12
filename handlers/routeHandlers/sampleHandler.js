//module scuffholding
handler = {}
// function to respond to the request properties
handler.sampleHandler = (requestProperties, callBack) => {
    console.log(requestProperties.body);
    //response with appropriate header 
    callBack(200, {
        message: 'this is sample url'
    })
}

//export the function to the handleReqRes module
module.exports = handler