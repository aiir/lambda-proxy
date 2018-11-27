const { join } = require('path');
const { parse } = require('url');

function getDateTimeStrings() {
  const now = new Date();
  const date = [
    String(now.getUTCDate()).padStart(2, '0'),
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getUTCMonth()],
    now.getFullYear(),
  ].join('/');
  const time = [
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
  ].map(value => String(value).padStart(2, '0')).join(':');
  return {
    requestTime: `${date}${time} +0000`,
    requestTimeEpoch: now.getTime(),
  };
}

function apiGatewayLambdaProxy(options = {}) {
  const {
    handler = 'index:handler',
    stage = 'development',
    taskDir = process.cwd(),
  } = options;

  return function requestListener(request, response) {
    console.log(`${request.method} ${request.url}`);
    const {
      headers,
      httpVersion,
      method: httpMethod,
      url,
    } = request;
    const { pathname: path, query: queryStringParameters } = parse(url, true);
    const resourcePath = (url === '/') ? '/' : '/{proxy+}';
    const { requestTime, requestTimeEpoch } = getDateTimeStrings();

    let body = '';
    request.on('data', (data) => { body += data; });
    request.on('end', async () => {
      const event = {
        body,
        headers,
        httpMethod,
        isBase64Encoded: false,
        path,
        pathParameters: null,
        queryStringParameters,
        requestContext: {
          httpMethod,
          identity: {
            cognitoIdentityPoolId: null,
            userAgent: headers['user-agent'],
            accountId: null,
            cognitoAuthenticationProvider: null,
            caller: null,
            accessKey: null,
            sourceIp: request.socket.localAddress,
            user: null,
            cognitoAuthenticationType: null,
            userArn: null,
            cognitoIdentityId: null,
          },
          path: resourcePath,
          protocol: `HTTP/${httpVersion}`,
          requestTime,
          requestTimeEpoch,
          resourcePath,
          stage,
        },
        resource: resourcePath,
        stageVariables: null,
      };
      let result;
      const [functionFilename, functionName] = handler.split(':');
      const moduleName = join(taskDir, functionFilename);
      try {
        const context = {};
        // eslint-disable-next-line global-require, import/no-dynamic-require
        result = await require(moduleName)[functionName](event, context);
      } catch ({ message }) {
        result = { statusCode: 500, body: `<html><p><strong>Error</strong>: ${message}</p>` };
      }
      const { statusCode = 200, headers: responseHeaders, body: responseBody } = result;
      response.writeHead(statusCode, responseHeaders);
      response.end(responseBody);
    });
  };
}

module.exports = apiGatewayLambdaProxy;
