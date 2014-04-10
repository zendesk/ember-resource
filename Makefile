DIST_JS = dist/ember-resource.js
JSHINT  = ./node_modules/jshint/bin/jshint
PHANTOM_JS = ./node_modules/mocha-phantomjs/bin/mocha-phantomjs

dist: $(DIST_JS) $(JSHINT)
	@$(JSHINT) $<

ci: dist test

$(DIST_JS): jshint
	@which broccoli > /dev/null || (echo "\n  Please install broccoli-cli: npm install -g broccoli-cli\n" && exit 1)
	@rm -rf dist
	@broccoli build dist
	@echo "\n  Build successful!\n"

jshint: $(JSHINT)
	@$(JSHINT) src/*.js src/vendor/*.js spec/javascripts/*Spec.js

test: test-ember-09 test-ember-1

test-ember-09: jshint $(PHANTOM_JS)
	$(PHANTOM_JS) spec/runner.html

test-ember-1: jshint $(PHANTOM_JS)
	$(PHANTOM_JS) spec/runner-1.0.html

$(JSHINT): npm_install

$(PHANTOM_JS): npm_install

npm_install:
	@npm install

clean:
	rm -rf ./dist

clobber: clean
	rm -rf ./node_modules

.PHONY: dist ci jshint test test-ember-09 test-ember-1 npm_install clean clobber
