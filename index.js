//dependency
const http = require("node:http");
const { handleReqRes } = require("./Helpers/handleReqRes");
const environment = require("./Helpers/environment");
const data = require("./lib/data");

//app-object; Module Scuffholding

const app = {};

//create server

app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`Server is running at: ${environment.port}`);
    console.log(`Your Environment variable is: ${process.env.NODE_ENV}`);
  });
};

//save imported function to app object.
app.handleReqRes = handleReqRes;

//Launch server
app.createServer();
