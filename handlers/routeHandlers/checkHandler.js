const data = require("../../lib/data");
const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../Helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../Helpers/environment");

//module scuffholding
handler2 = {};
// function to respond to the request properties
handler2.checkHandler = (requestProperties, callBack) => {
  //response with appropriate header
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler2._check[requestProperties.method](requestProperties, callBack);
  } else {
    callBack(405);
  }
};
handler2._check = {};

handler2._check.post = (requestProperties, callBack) => {
  //validate the body data
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  const method =
    typeof requestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length == 20
        ? requestProperties.headersObject.token
        : false;
    data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = parseJSON(tokenData).phone;
        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                if (userChecks.length < maxChecks) {
                  const checkId = createRandomString(20);
                  const checkObject = {
                    id: checkId,
                    phone: userPhone,
                    protocol: protocol,
                    url: url,
                    method: method,
                    successCodes: successCodes,
                    timeoutSeconds: timeoutSeconds,
                  };
                  data.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      data.update("users", userPhone, userObject, (err4) => {
                        if (!err) {
                          callBack(200, checkObject);
                        } else {
                          callBack(500, { message: "problem in the server" });
                        }
                      });
                      //callBack(200, { message: "Created successfully" });
                    } else {
                      callBack(500, { message: "problem in the server" });
                    }
                  });
                } else {
                  callBack(401, {
                    error: "User has already reached maximum check limit.",
                  });
                }
              } else {
                callBack(403, { error: "Authentication Failure" });
              }
            });
          } else {
            callBack(404, { error: "User not found" });
          }
        });
      } else {
        callBack(403, { error: "Authentication Failure" });
      }
    });
  } else {
    callBack(400, { error: "You have a problem on your request" });
  }
};

handler2._check.get = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryObject.id === "string" &&
    requestProperties.queryObject.id.trim().length == 20
      ? requestProperties.queryObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string" &&
          requestProperties.headersObject.token.trim().length == 20
            ? requestProperties.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).phone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callBack(200, parseJSON(checkData));
            } else {
              callBack(403, { message: "Authentication failed" });
            }
          }
        );
      } else {
        callBack(404, { message: "Your requested check not found" });
      }
    });
  } else {
    callBack(400, { message: "You have a problem on your request!" });
  }
};

handler2._check.put = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length == 20
      ? requestProperties.body.id
      : false;

  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  const url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  const method =
    typeof requestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  const successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          const token =
            typeof requestProperties.headersObject.token === "string" &&
            requestProperties.headersObject.token.trim().length == 20
              ? requestProperties.headersObject.token
              : false;
          const checkObject = parseJSON(checkData);

          tokenHandler._token.verify(
            token,
            checkObject.phone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }

                data.update("checks", id, checkObject, (err1) => {
                  if (!err1) {
                    callBack(200, {
                      message: "check data updated successfully",
                    });
                  } else {
                    callBack(500, { message: "Server side error" });
                  }
                });
              } else {
                callBack(403, { message: "Authentication failed" });
              }
            }
          );
        } else {
          callBack(404, { message: "Your requested check not found" });
        }
      });
    } else {
      callBack(400, { error: "You must provide at least one field." });
    }
  } else {
    callBack(400, { error: "you have a problem on your request" });
  }
};

handler2._check.delete = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryObject.id === "string" &&
    requestProperties.queryObject.id.trim().length == 20
      ? requestProperties.queryObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof requestProperties.headersObject.token === "string" &&
          requestProperties.headersObject.token.trim().length == 20
            ? requestProperties.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).phone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              data.delete("checks", id, (err1) => {
                if (!err1) {
                  data.read(
                    "users",
                    parseJSON(checkData).phone,
                    (err2, userData) => {
                      let userObject = parseJSON(userData);
                      if (!err2 && userData) {
                        let userChecks =
                          typeof userObject.checks === "object" &&
                          userObject.checks instanceof Array
                            ? userObject.checks
                            : [];

                        let checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          userObject.checks = userChecks;
                          data.update(
                            "users",
                            userObject.phone,
                            userObject,
                            (err4) => {
                              if (!err4) {
                                callBack(200, {
                                  message: "check deleted successfully",
                                });
                              } else {
                                callBack(500, { message: "Server side error" });
                              }
                            }
                          );
                        } else {
                          callBack(500, {
                            message: "Not found in the user data",
                          });
                        }
                      } else {
                        callBack(500, { message: "Server side error" });
                      }
                    }
                  );
                } else {
                  callBack(500, { message: "Server side error" });
                }
              });
            } else {
              callBack(403, { message: "Authentication failed" });
            }
          }
        );
      } else {
        callBack(404, { message: "Your requested check not found" });
      }
    });
  } else {
    callBack(400, { message: "You have a problem on your request!" });
  }
};

//export the function to the handleReqRes module
module.exports = handler2;
