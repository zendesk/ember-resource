DIST_JS = dist/ember-resource.js
JSHINT  = ./node_modules/jshint/bin/jshint

dist: $(DIST_JS)
	$(JSHINT) $<

ci: dist

$(DIST_JS): jshint
	cat src/vendor/lru.js src/base.js src/remote_expiry.js src/identity_map.js src/ember-resource.js > $@

jshint: npm_install
	$(JSHINT) src/*.js src/vendor/*.js spec/javascripts/*Spec.js

test: jshint npm_install
	./node_modules/mocha-phantomjs/bin/mocha-phantomjs spec/suite.html

npm_install:
	npm install

clean:
	rm -f dist/*

.PHONY: dist ci jshint test npm_install clean
