DIST_JS = dist/ember-resource.js
JSHINT  = ./node_modules/jshint/bin/jshint

dist: $(DIST_JS)
	$(JSHINT) $<

ci: dist test

$(DIST_JS): jshint
	mkdir -p dist
	cat src/vendor/lru.js src/base.js src/remote_expiry.js src/identity_map.js src/fetch.js src/ember-resource.js > $@

jshint: npm_install
	$(JSHINT) src/*.js src/vendor/*.js spec/javascripts/*Spec.js

test: test-ember-09 test-ember-1

test-ember-09: jshint npm_install
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs spec/runner.html

test-ember-1: jshint npm_install
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs spec/runner-1.0.html

npm_install:
	npm install

clean:
	rm -rf ./dist

clobber: clean
	rm -rf ./node_modules

.PHONY: dist ci jshint test npm_install clean clobber
