const http = require('http');

function generateQueryString(params) {
  const str = [];

  Object.keys(params).forEach((key) => {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
  });
  return str.join('&');
}

module.exports.handler = (event, context, callback) => {
  console.log(JSON.stringify(event));
  // Setup request options and parameters
  const options = {
    host: process.env.LOAD_BALANCER_DNS_NAME,
    port: 80,
    path: event.path,
    method: event.httpMethod,
  };

  // If you have headers, set them. Otherwise set to an empty map.
  if (event.headers && Object.keys(event.headers).length > 0) {
    options.headers = event.headers;
  } else {
    options.headers = {};
  }

  // Build the query string.
  if (
    event.queryStringParameters &&
    event.queryStringParameters &&
    Object.keys(event.queryStringParameters).length > 0
  ) {
    const queryString = generateQueryString(event.queryStringParameters);
    if (queryString !== '') {
      options.path += `?${queryString}`;
    }
  }

  console.log(options);
  const req = http.request(options, (response) => {
    let responseString = '';
    response.setEncoding('utf8');
    // Another chunk of data has been received, so append it to `str`.
    response.on('data', (chunk) => {
      responseString += chunk;
    });
    // The whole response has been received
    response.on('end', () => {
      const result = {
        statusCode: response.statusCode,
        headers: response.headers,
        body: responseString,
      };
      callback(null, result);
    });
  });
  if (event.body && event.body !== '') {
    req.write(event.body);
  }
  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
    callback({ statusCode: 500, headers: {}, body: e.message });
  });
  req.end();
};
