const data = require("../../lib/data");
const { hash, parseJSON } = require("../../Helpers/utilities");
const tokenHandler = require("./tokenHandler");

//module scuffholding
handler = {};
// function to respond to the request properties
handler.userHandler = (requestProperties, callBack) => {
  //response with appropriate header
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._user[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};
handler._user = {};

handler._user.post = (requestProperties, callBack) => {
  //validate the body data
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length == 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;
  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean" &&
    requestProperties.body.tosAgreement.length != false
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    data.read("users", phone, (err) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };

        data.create("users", phone, userObject, (err1) => {
          if (!err1) {
            callBack(200, { message: "Created successfully" });
          } else {
            callBack(500, { message: "problem in the server" });
          }
        });
      } else {
        callBack(500, { message: "Already enrolled with this phone number" });
      }
    });
  } else {
    callBack(505, "You have a problem on your request");
  }
};

handler._user.get = (requestProperties, callBack) => {
  const phone =
    typeof requestProperties.queryObject.phone === "string" &&
    requestProperties.queryObject.phone.trim().length == 11
      ? requestProperties.queryObject.phone
      : false;
  if (phone) {
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length == 20
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read("users", phone, (err, u) => {
          const user = parseJSON(u);
          if (!err && user) {
            delete user.password;
            callBack(200, user);
          } else {
            callBack(404, { message: "Your requested phone number not found" });
          }
        });
      } else {
        callBack(403, { message: "Authentication failed" });
      }
    });
  } else {
    callBack(404, { message: "Your requested phone number not found" });
  }
};

handler._user.put = (requestProperties, callBack) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === "string" &&
    requestProperties.body.phone.trim().length == 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length == 20
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        if (firstName || lastName || password) {
          data.read("users", phone, (err, user) => {
            const userData = { ...parseJSON(user) };
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (firstName) {
                userData.lastName = lastName;
              }
              if (firstName) {
                userData.password = hash(password);
              }

              data.update("users", phone, userData, (err1) => {
                if (!err1) {
                  callBack(200, { message: "Userdata updated successfully" });
                } else {
                  callBack(500, {
                    message: "there was a problem on the server",
                  });
                }
              });
            } else {
              callBack(404, { error: "you have a problem on your request" });
            }
          });
        } else {
          callBack(404, { error: "you have a problem on your requests" });
        }
      } else {
        callBack(403, { message: "Authentication failed" });
      }
    });
  } else {
    callBack(404, { error: "phone number is not valid" });
  }
};

handler._user.delete = (requestProperties, callBack) => {
  const phone =
    typeof requestProperties.queryObject.phone === "string" &&
    requestProperties.queryObject.phone.trim().length == 11
      ? requestProperties.queryObject.phone
      : false;

  if (phone) {
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length == 20
        ? requestProperties.headersObject.token
        : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.delete("users", phone, (err) => {
          if (!err) {
            callBack(200, { message: "The user was deleted successfully" });
          } else {
            callBack(500, { error: "Sorry, there was problem on the server." });
          }
        });
      } else {
        callBack(403, { message: "Authentication failed" });
      }
    });
  } else {
    callBack(404, { error: "User not found" });
  }
};

//export the function to the handleReqRes module
module.exports = handler;
