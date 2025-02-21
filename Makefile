BUILD_GIT_HASH = $(shell git describe --always)
BUILD_TIMESTAMP = $(shell TZ="UTC" LC_TIME="en_US.utf8" date)

## default: run up 
default: up

## dev-web: start development web app
dev-web:
	npm run --prefix web dev

## dev-server: start development server app
dev-server:
	make dev -C server
	cd server && dist/server

## build: build server, web app and docker containers
build:
	make -C server
	npm --prefix web ci
	npm run --prefix web build
	mkdir -p server/dist
	mv web/dist server/dist/web
	docker compose build --build-arg BUILD_GIT_HASH="$(BUILD_GIT_HASH)" --build-arg BUILD_TIMESTAMP="$(BUILD_TIMESTAMP)"

## up: build and start docker containers
up: build
	docker compose up --no-build

## help: print this help message
help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'
