const lambda = require('docker-lambda');
const { join, normalize } = require('path');
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
    handler,
    runtime = 'nodejs8.10',
    stage = 'development',
    taskDir = '',
    network,
  } = options;
  const absoluteTaskDir = taskDir.startsWith('/') ? taskDir : normalize(join(process.cwd(), taskDir));
  const dockerArgs = (network !== undefined) ? ['--network', network] : [];

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
    request.on('end', () => {
      const event = {
        body,
        headers: { ...headers },
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
      const lambdaOptions = {
        dockerImage: `lambci/lambda:${runtime}`,
        event,
        handler,
        taskDir: absoluteTaskDir,
        dockerArgs,
      };
      const {
        statusCode = 200,
        headers: responseHeaders,
        body: responseBody,
      } = lambda(lambdaOptions) || {};
      response.writeHead(statusCode, responseHeaders);
      response.end(responseBody);
    });
  };
}

module.exports = apiGatewayLambdaProxy;
