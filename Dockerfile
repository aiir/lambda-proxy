FROM lambci/lambda:nodejs8.10

COPY bin /var/task/bin
COPY lib /var/task/lib

EXPOSE 3000/tcp

WORKDIR /var/task/subtask

ENTRYPOINT ["/var/lang/bin/node", "/var/task/bin/lambda-proxy.js"]
