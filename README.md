# API Gateway Lambda Proxy

Simulates AWS API Gateway with Lambda proxy integration locally for development.

All paths will proxied to the Lambda function as if the API Gateway stage is
configured with a standard root and Proxy Resource (e.g. `{proxy+}`) both
configured to use the same Lambda function.

The `Dockerfile` packages this script inside the `lambci/lambda` Docker
container, to give a runtime environment as close as possible to the real thing.

## Changes from v1

The previous version internally launched a Docker container to handle a request
as each incoming request was received. This version changes this to mount the
API Gateway Proxy handling logic inside the Docker container itself.

The benefit of this is a faster response time, plus allowing for this container
to be included in a `docker-compose` template to allow testing of a larger
system, where the Lambda function may have external dependencies that also want
to be emulated locally.

## Requirements

Docker is required to build and run the resulting container, which then includes
the necessary Node environment for you.

## Setup

```
docker build . -t aiir/lambda-proxy
```

## Usage

The resulting image needs your Lambda function codebase to be mounted in
`/var/task/subtask` and port 3000 needs exposing to the host to call via HTTP.

```
docker run -v .:/var/task/subtask -P 3000:3000 aiir/lambda-proxy
```

Alternatively, include it as part of a `docker-compose.yaml` file in your target
project:

```
version: '3'
services:
  cache:
    image: redis:4.0-alpine
  db:
    image: mysql:5.6
  lambda:
    image: aiir/lambda-proxy
    volumes:
      - ${PWD}:/var/task/subtask
    ports:
      - 3000:3000
```

In the above example the Lambda function would now be able to connect to Redis
running on the host `cache` and MySQL on the host `db`.

## Authors

- Created by [@andybee](https://twitter.com/andybee)

## License

MIT
