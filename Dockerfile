# Build go binary.
FROM golang:1.23 AS builder

ARG BUILD_GIT_HASH
ARG BUILD_TIMESTAMP

WORKDIR /app

COPY ./server ./

RUN CGO_ENABLED=0 go build -ldflags \
    " \
    -X 'main.BuildGitHash=${BUILD_GIT_HASH}' \
    -X 'main.BuildTimestamp=${BUILD_TIMESTAMP}' \
    " \
    -o dist/server ./cmd/server

# Build server application.
FROM alpine:latest

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json

WORKDIR /app

COPY --from=builder /app/gcp-key.json* /app/
COPY --from=builder /app/api/swagger /app/api/swagger
COPY --from=builder /app/database/migrations /app/database/migrations
COPY --from=builder /app/deployments /app/deployments
COPY --from=builder /app/dist/web /app/dist/web
COPY --from=builder /app/dist/server /app/dist/server
COPY --from=builder /app/config.yml /app/config.yml

RUN apk update
RUN apk upgrade
RUN apk add ca-certificates

CMD ["/app/dist/server"]
