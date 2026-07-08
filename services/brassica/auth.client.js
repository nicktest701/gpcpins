// services/brassica/auth.client.js

const axios = require("axios");
const CircuitBreaker = require("opossum");

const brassicaConfig = require("../../config/brassica");

const authenticateRequest = async () => {
  logger.info("Refreshing Brassica Pay Bearer token...");

  const url = `${brassicaConfig.baseURL}/Authenticate`;

  const response = await axios.post(
    url,
    {
      userName: brassicaConfig.credentials.userName,
      password: brassicaConfig.credentials.password,
    },
    {
      timeout: brassicaConfig.timeout,
      headers: { "Content-Type": "application/json" },
    },
  );

  const { data } = response;
console.log(data)
  return data;
};

const authBreaker = new CircuitBreaker(authenticateRequest, {
  timeout: 35000,
  errorThresholdPercentage: 50,
  resetTimeout: 60000,
});

module.exports = { authBreaker };
