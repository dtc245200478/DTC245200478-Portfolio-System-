FROM alpine:3.23.3
RUN apk add --no-cache logrotate
COPY --chmod=0644 logrotate.conf /etc/logrotate.conf
CMD ["sh", "-c", "while true; do logrotate /etc/logrotate.conf; sleep 60; done"]
