const data = require('../../lib/data')
const {hash, parseJSON, createRandomString} = require('../../Helpers/utilities')



//module scuffholding
handler1 = {}
// function to respond to the request properties
handler1.tokenHandler = (requestProperties, callBack) => {
    

    //response with appropriate header 
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if(acceptedMethods.indexOf(requestProperties.method)>-1){
        handler1._token[requestProperties.method](requestProperties, callBack);
        
    }else{
        callBack(405)
    }
    
}
handler1._token ={}

handler1._token.post= (requestProperties, callBack)=>{
        const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length==11 ? requestProperties.body.phone : false;
        const password = typeof requestProperties.body.password  === 'string' && requestProperties.body.password.trim().length>0 ? requestProperties.body.password : false;
        
        if(phone && password){
            data.read('users',phone, (err,userData)=>{
                if (!err && userData){
                    let hashedPassword = hash(password)
                    if (hashedPassword===parseJSON(userData).password) {
                        let tokenID = createRandomString(20)
                        let expires = Date.now()+60*60*1000;
                        let tokenObject = {
                            phone,
                            'id':tokenID,
                            expires
                        }
                        
                        data.create('tokens', tokenID, tokenObject,(err2)=>{
                            if (!err2) {
                                callBack(200, tokenObject)
                            } else {
                                callBack(500, {message:'Server side error.'})
                            }
                        })


                    } else {
                        callBack(404,{error:'Wrong password!'})
                    }
                    
                } else {
                    callBack(404,{error:'Your phone number is not valid.'})
                }
            });
        }

    

 }

 handler1._token.get= (requestProperties, callBack)=>{
     const id = typeof requestProperties.queryObject.id === 'string' && requestProperties.queryObject.id.trim().length==20 ? requestProperties.queryObject.id : false;
    if(id){
        data.read('tokens', id, (err, t)=>{
            const tokenData = {...parseJSON(t)}
            if (!err && tokenData) {
                
                callBack(200,tokenData)
            }else{
                 callBack(404, {message:'Your requested token not found.'})
            }
        });
    }else{
        callBack(404, {message:'Your requested token not found'})
    }
 }
 handler1._token.put= (requestProperties, callBack)=>{
     const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length==20 ? requestProperties.body.id : false;
     
     const extend = typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend==true ? requestProperties.body.extend : false;
   
     if(id && extend){
        data.read('tokens', id, (err, tData)=>{
            tokenData = parseJSON(tData)
            if (!err && tokenData) {
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now()+60*60*1000

                    data.update('tokens', id, tokenData, (err)=>{
                        if(!err){
                             callBack(200, {message:'token updated successfully'})
                        }else{
                             callBack(500, {message:'Server side error'})
                        }
                    });
                } else {
                    callBack(404, {message:'Token expired'})
                }
            } else {
                callBack(404, {message:'Your requested token not found'})
            }
        });
     }else{
        callBack(404, {error:'you have a problem on your request'})
     }
   
 }

handler1._token.delete= (requestProperties, callBack)=>{
     const id = typeof requestProperties.queryObject.id === 'string' && requestProperties.queryObject.id.trim().length==20 ? requestProperties.queryObject.id : false;
     
    if(id){
        data.read('tokens', id, (err, t)=>{
            const tokenData = {...parseJSON(t)}
            if (!err && tokenData) {
                data.delete('tokens', id, (err2)=>{
                    if (!err2) {
                        callBack(200,{message:'The token was deleted successfully'})
                    } else {
                        callBack(500,{error:'Sorry, there was problem on the server.'})
                    }
                });
                
                //callBack(200,tokenData)
            }else{
                 callBack(404, {message:'Your requested token not found.'})
            }
        });
    }else{
        callBack(404, {message:'Your requested token not found'})
    }
 }

handler1._token.verify = (id, phone, callBack) =>{
    data.read('tokens', id, (err, tData)=>{
        tokenData = parseJSON(tData)
        if (!err && tokenData) {
            if (tokenData.phone===phone && tokenData.expires>Date.now()) {
                callBack(true)
            } else {
                callBack(false)
            }
        } else {
            callBack(false)
        }
    });
}

 

//export the function to the handleReqRes module
module.exports = handler1