//Dependecies
const { query, response } = require("express");
const { twilio } = require("./environment");
const https = require("https");
const querystring = require("querystring");

const notifications = {};

notifications.sendTwilioSMS = (phone, message, callback) => {
  const userPhone =
    typeof phone === "string" && phone.trim().length == 11 ? phone : false;
  const userMsg =
    typeof message === "string" &&
    message.trim().length > 0 &&
    message.trim().length < 1600
      ? message.trim()
      : false;

  if (userPhone && userMsg) {
    //configure the request payload
    const payload = {
      from: twilio.fromPhone,
      to: `+088${userPhone}`,
      body: userMsg,
    };
    //stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    //configure the request
    const options = {
      hostName: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/message.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    //instantiate the request
    const req = https.request(options, (res) => {
      //get the status of the sent request
      const status = res.statusCode;
      //callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`statuscode returned was ${status}`);
      }
      //res.on("data", (d) => {});
      req.on("error", (e) => {
        callback(e);
      });
      req.write(stringifyPayload);
      req.end();
    });
  } else {
    callback("Parameters were missing or invalid.");
  }
};

module.exports = notifications;

/*
import the file on the index.js 

sendTwilioSms('0140000000', 'Hello', (err)=>{
    log(this is err:, err)
})



*/
