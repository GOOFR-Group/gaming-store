GOPATH=$(shell go env GOPATH)

BUILD_GIT_HASH = $(shell git describe --always)
BUILD_TIMESTAMP = $(shell TZ="UTC" LC_TIME="en_US.utf8" date)

LINTER_VERSION=v1.61.0

## default: run clean, generate, tidy, vendor, lint, test and build
default: clean generate tidy vendor lint test build

## dev: run clean, generate, tidy, vendor and build
dev: clean generate tidy vendor build

## clean: clean the vendor and dist directories and generated files
clean:
	rm -rf vendor/
	rm -rf dist/
	find . -name "*.gen.go" -type f -delete

## tidy: add missing and remove unused modules
tidy:
	go mod tidy

## vendor: make vendored copy of dependencies
vendor:
	go mod vendor

## generate: run go generate ./...
generate:
	go generate ./...

## lint: install golangci-lint and analyze the source code with the configuration in .golangci.yml
lint:
	command -v golangci-lint || curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(GOPATH)/bin $(LINTER_VERSION)
	golangci-lint run --timeout=5m

## test-unit: run unit tests
test-unit:
	go test ./...

## test-integration: run integration tests
test-integration:
	go test -tags=integration ./...

## test: run unit and integration tests
test: test-unit test-integration

BUILD_FLAGS = " \
-X 'main.BuildGitHash=$(BUILD_GIT_HASH)' \
-X 'main.BuildTimestamp=$(BUILD_TIMESTAMP)'"

## build: build server to the dist directory
build:
	go build -ldflags $(BUILD_FLAGS) -o dist/server ./cmd/server

## help: print this help message
help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'
