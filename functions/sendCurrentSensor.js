const axios = require("axios");
const crypto = require("crypto");

const endpoint = "https://openapi.tuyaus.com";
const accessId = "pgyfpce8hrqkshk9538r";
const accessSecret = "b52595f26b634d6ab3c48ba5e4486cb3";

let cachedToken = null;
let cachedTokenRes = null;

async function getClient(config) {
  if (!cachedToken) {
    await refreshToken(config);
  }
  return axios.create({ baseURL: config.endpoint });
}

async function refreshToken(config, refreshToken = "") {
  const url = refreshToken
    ? `/v1.0/token/${refreshToken}`
    : "/v1.0/token?grant_type=1";
  const headers = getHeaders(config, "GET", url);

  try {
    const response = await axios.get(config.endpoint + url, { headers });
    if (response.data.success) {
      cachedToken = response.data.result.access_token;
      cachedTokenRes = response.data.result;
    } else {
      throw new Error("Unable to obtain access token.");
    }
  } catch (error) {
    console.error("Error getting token:", error);
    throw error;
  }
}

function getHeaders(config, method, url, body = "", appendHeaders = {}) {
  const accessToken = cachedToken || "";
  const nonce = crypto.randomBytes(16).toString("hex");
  const t = Date.now();

  let headersStr = "";
  for (const [k, v] of Object.entries(appendHeaders)) {
    headersStr += `${k}:${v}\n`;
  }

  const stringToSign = `${method}\n${crypto
    .createHash("sha256")
    .update(body)
    .digest("hex")}\n${headersStr.trim()}\n${url}`;
  const sign = crypto
    .createHmac("sha256", config.accessSecret)
    .update(config.accessId + accessToken + t + nonce + stringToSign)
    .digest("hex")
    .toUpperCase();

  const headers = {
    client_id: config.accessId,
    sign_method: "HMAC-SHA256",
    t: t,
    nonce: nonce,
    sign: sign,
  };

  if (accessToken) {
    headers["access_token"] = accessToken;
  }

  return headers;
}

async function sendCurrentSensor() {
  const uid = "ebfd59c0a0d19b5815paic"; // Use the correct UID
  const config = {
    endpoint: endpoint,
    accessId: accessId,
    accessSecret: accessSecret,
  };

  try {
    const client = await getClient(config);
    const url = `/v1.0/devices/${uid}`;
    const headers = getHeaders(config, "GET", url);

    // Adding additional headers for the request
    headers["mode"] = "cors";
    headers["Content-Type"] = "application/json";

    let response = await client.get(url, { headers });
    if (response.data.code === 1010) {  // If token is invalid
      console.log("Token expired, refreshing token...");
      await refreshToken(config);
      // Retry the request with the new token
      response = await client.get(url, { headers: getHeaders(config, "GET", url) });
    }

    const data = response.data;
    console.log(data);

    return data;
  } catch (error) {
    console.error(
      "Error fetching devices:",
      error.response ? error.response.data : error.message
    );
    return { error: "Failed to get devices" };
  }
}

module.exports = sendCurrentSensor;