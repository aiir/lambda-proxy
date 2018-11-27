/**
 * Provides a very basic Lambda function that echos the `event` object.
 */
module.exports.handler = async event => ({
  headers: { 'X-Custom-Header': 'HelloWorld' },
  body: `<html><h1>Hello World</h1><pre>${JSON.stringify(event, undefined, 2)}</pre>`,
});
