all: clean test

jshint: npm_install
	./node_modules/jshint/bin/jshint src/*.js spec/javascripts/*Spec.js

test: jshint npm_install
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs spec/suite.html

npm_install:
	npm install

clean:
	rm -f dist/*

.PHONY: jshint test npm_install clean
