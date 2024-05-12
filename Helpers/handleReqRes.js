//Import Dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");
const routes = require("../route");
const { parseJSON } = require("./utilities");

//Module Scuffholding

const handler = {};

//handle Request Response. From the user, recieve request url-property, headers-object and body.

handler.handleReqRes = (req, res) => {
  //Step-1

  //parsing URL
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;

  //trim the url-path based on apropriate slashes before and after.
  const trimPath = path.replace(/^\/+|\/+$/g, "");

  //collect the query properties as an object.
  const queryObject = parseUrl.query;

  //collect headers from request objects
  const headersObject = req.headers;
  //lowercase the mathod
  const method = req.method.toLowerCase();

  // save the request properties to object
  const requestUrlProperties = {
    parseUrl,
    path,
    trimPath,
    headersObject,
    method,
    queryObject,
  };

  //recieve the body data from the post request
  const decode = new StringDecoder();
  let buffer = "";
  req.on("data", (chunk) => {
    buffer += decode.write(chunk);
  });

  //Step-2

  // Check if requested path is valid; if so then take the route handler function.
  const chosenHandler = routes[trimPath] ? routes[trimPath] : notFoundHandler;

  req.on("end", () => {
    //end the decoding after successful decoding data
    buffer += decode.end();
    //push the body object to the requestproperties
    requestUrlProperties.body = parseJSON(buffer);

    //call the route handler  function from route.js with appropriate request properties
    chosenHandler(requestUrlProperties, (statusCode, payload) => {
      //filter the statuscode and payload
      statusCode = typeof statusCode === "number" ? statusCode : 505;
      payload = typeof payload === "object" ? payload : {};

      //stringify the payload
      const payloadString = JSON.stringify(payload);
      //send the resoponse to the application
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

module.exports = handler;
