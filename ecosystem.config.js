const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

module.exports = [
  {
    script: "dist/index.js",
    name: "bridge-relayer",
    env: {
      PRIVATE_KEY: process.env.PRIVATE_KEY,
      MANAGER_SERVER: process.env.MANAGER_SERVER,
      COINMARKET_CAP_KEY: process.env.COINMARKET_CAP_KEY,
    },
  },
];
