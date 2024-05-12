const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");
const { checkHandler } = require("./handlers/routeHandlers/checkHandler");

const routes = {
  //call the specific function for specific path
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};
// export the function.
module.exports = routes;
