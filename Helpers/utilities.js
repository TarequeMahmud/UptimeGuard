const crypto = require('node:crypto')
const environment = require('./environment')
//module scuffholding
const utilities = {}

//parse the json
utilities.parseJSON = (jsonString)=>{
    let output;
    try {
        output = JSON.parse(jsonString)
    } catch (error) {
        output = {message:error}
    }
    return output;
};

utilities.hash = (str)=>{
    if(typeof str === 'string' && str.length>0){
    const hash = crypto.createHmac('sha256', environment.secretKey).update(str).digest('hex');
    return hash
    }else{
        return false
    }
};

utilities.createRandomString = (strlen) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
    const length = typeof strlen === 'number' && strlen>0 ? strlen : false;
    let randomString= ''
    if (length) {
        for(i=1; i<=length; i++){
        randomString += chars.charAt(Math.floor(Math.random()*chars.length))
    }
        return randomString;
    }
    return false;
    
}


module.exports = utilities;
