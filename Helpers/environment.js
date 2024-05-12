//module scuffholding
const environments = {};

// Port for staging
environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "udfiaghilurweytfhcv",
  maxChecks: 5,
  twilio: {
    fromPhone: "",
    accountSid: "",
    authToken: "",
  },
};

//Port for Production
environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "udfiaghilurwgfdsgeytfhcv",
  maxChecks: 5,
  twilio: {
    fromPhone: "",
  },
};

//Deternmine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";
//export the corresponding object
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
