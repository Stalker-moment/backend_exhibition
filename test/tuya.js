const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const endpoint = 'https://openapi.tuyaus.com';
const accessId = 'pgyfpce8hrqkshk9538r';
const accessSecret = 'b52595f26b634d6ab3c48ba5e4486cb3';

let cachedToken = null;
let cachedTokenRes = null;

function getClient(config) {
  if (!cachedToken) {
      return getToken(config).then(tokenRes => {
          if (tokenRes.success) {
              cachedToken = tokenRes.result.access_token;
              cachedTokenRes = tokenRes.result;
          } else {
              throw new Error('Unable to obtain access token.');
          }
          return axios.create({ baseURL: config.endpoint });
      });
  }
  return Promise.resolve(axios.create({ baseURL: config.endpoint }));
}

function getToken(config, refreshToken = '') {
  const url = refreshToken ? `/v1.0/token/${refreshToken}` : '/v1.0/token?grant_type=1';
  const headers = getHeaders(config, 'GET', url);
  
  return axios.get(config.endpoint + url, { headers })
    .then(response => {
        console.log(response.data);
        return response.data;
    })
      .catch(error => {
          console.error('Error getting token:', error);
          throw error;
      });
}

function getHeaders(config, method, url, body = '', appendHeaders = {}) {
  const accessToken = cachedToken || '';
  const nonce = crypto.randomBytes(16).toString('hex');
  const t = Date.now();

  let headersStr = '';
  for (const [k, v] of Object.entries(appendHeaders)) {
      headersStr += `${k}:${v}\n`;
  }

  const stringToSign = `${method}\n${crypto.createHash('sha256').update(body).digest('hex')}\n${headersStr.trim()}\n${url}`;
  const sign = crypto.createHmac('sha256', config.accessSecret)
      .update(config.accessId + accessToken + t + nonce + stringToSign)
      .digest('hex')
      .toUpperCase();

  const headers = {
      'client_id': config.accessId,
      'sign_method': 'HMAC-SHA256',
      't': t,
      'nonce': nonce,
      'sign': sign
  };

  if (accessToken) {
      headers['access_token'] = accessToken;
  }

  return headers;
}

app.get('/getDevices', (req, res) => {
  const uid = 'ebfd59c0a0d19b5815paic'; // Use the correct UID
  const config = {
      endpoint: endpoint,
      accessId: accessId,
      accessSecret: accessSecret
  };

  getClient(config).then(client => {
      const url = `/v1.0/devices/${uid}`;
      const headers = getHeaders(config, 'GET', url);
      
      // Adding additional headers for the request
      headers['mode'] = 'cors';
      headers['Content-Type'] = 'application/json';

      client.get(url, { headers })
          .then(response => {
              const data = response.data;
              console.log(data);

              if (data && data.result && Array.isArray(data.result)) {
                  const deviceIdsFromAPI = data.result.map(device => device.id);
                  res.json(data);
              } else {
                  res.status(500).json({ error: 'Unexpected API response structure', data: data });
              }
          })
          .catch(error => {
              console.error('Error fetching devices:', error.response ? error.response.data : error.message);
              res.status(500).json({ error: error.message });
          });
  }).catch(error => {
      console.error('Error getting client:', error);
      res.status(500).json({ error: 'Failed to get API client' });
  });
});

app.get('/getComponent/:id', (req, res) => {
    const componentId = req.params.id;
    // Retrieve component from your database by ID
    // Example: const data = findComponentById(componentId);
    res.json(data);
});

app.post('/editComponent', (req, res) => {
    const { id_component, category_id } = req.body;

    if (!id_component || !category_id) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    // Update the component in your database with the new data
    // Example: updateComponent(id_component, { category_id });

    res.redirect('/showComponent').json({ success: 'Category Component Added Successfully.' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
