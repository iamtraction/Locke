.PHONY: all clean test lint build

all: clean test build


clean: clean-dist clean-typings

clean-dist:
	@echo Cleaning transpiled JavaScript code...
	@rm -rf dist &>/dev/null
	@echo Done.

clean-typings:
	@echo Cleaning generated typings...
	@rm -rf typings &>/dev/null
	@echo Done.


test: lint


lint: lint-typescript

lint-typescript:
	@echo "Linting TypeScript files..."
	@npm test


build: transpile

transpile:
	@echo "Transpiling TypeScript to JavaScript..."
	@npm run build
