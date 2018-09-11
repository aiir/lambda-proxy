# API Gateway Lambda Proxy

Simulates AWS API Gateway with Lambda proxy integration locally for development.

All paths will proxied to the Lambda function as if the API Gateway stage is
configured with a standard root and Proxy Resource (e.g. `{proxy+}`) both
configured to use the same Lambda function.

The Lambda function is invoked via the `lambci/lambda` Docker container, to give
a runtime environment as close as possible to the real thing.

## Requirements

As well as Node.js 8.10 or later, Docker must also be installed and running on
the same machine to run the Lambda emulation container.

## Installation

Install the package globally so you can use it easily within your actual Lambda
project.

```
$ npm install -g @aiir\lambda-proxy
```

This will add a `lambda-proxy` executable to `PATH`.

## Usage

By default, the script will attempt to start an HTTP server on port 3000 and for
any incoming request execute a Node.js 8.10-based Lambda function called
`handler` from index.js from the current directory:

```
lambda-proxy
```

You can modify this behaviour through the following environment variables:

<dl>
  <dt><code>TASK_DIR</code></dt>
  <dd>
    Sets the path to the directory containing the Lambda script. Defaults to the
    current directory.
  </dd>
  <dt><code>RUNTIME</code></dt>
  <dd>
    Allows you to set which Lambda runtime you want. This sets which Docker
    container tag to use, refer to the
    <a href="https://github.com/lambci/docker-lambda">documentation</a>
    for a full list of available tags. Defaults to <code>nodejs8.10</code>.
  </dd>
  <dt><code>HANDLER</code></dt>
  <dd>
    Changes the file and handler function, e.g. <code>index.myHandler</code>
    uses the file <code>index.js</code> and the function <code>myHandler</code>.
    Defaults to <code>index.handler</code>.
  </dd>
  <dt><code>STAGE</code></dt>
  <dd>
    Sets the API Gateway stage name included in the event object sent to the
    Lambda function. Defaults to <code>development</code>.
  </dd>
  <dt><code>NETWORK</code></dt>
  <dd>
    Allows you to optionally override the default network of the Lambda function
    execution Docker container, for example to link it with a container acting
    as a VPN client.
  </dd>
</dl>

## Authors

- Created by [@andybee](https://twitter.com/andybee)

## License

MIT
