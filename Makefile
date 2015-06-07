DIST_JS = dist/ember-resource.js

BROCCOLI   = ./node_modules/broccoli-cli/bin/broccoli
JSHINT     = ./node_modules/jshint/bin/jshint
PHANTOM_JS = ./node_modules/mocha-phantomjs/bin/mocha-phantomjs

dist: $(DIST_JS) $(JSHINT)
	@$(JSHINT) $<

ci: dist test

$(DIST_JS): jshint $(BROCCOLI)
	@rm -rf dist
	$(BROCCOLI) build dist
	@echo "\n  Build successful!\n"

jshint: $(JSHINT)
	@$(JSHINT) src/*.js src/vendor/*.js spec/javascripts/*Spec.js

test: test-ember-current test-ember-next

test-ember-current: jshint $(PHANTOM_JS)
	$(PHANTOM_JS) spec/runner.html

test-ember-next: jshint $(PHANTOM_JS)
	$(PHANTOM_JS) spec/runner-next.html

$(BROCCOLI): npm_install
$(JSHINT): npm_install
$(PHANTOM_JS): npm_install

npm_install:
	npm install > /dev/null

clean:
	rm -rf ./dist

clobber: clean
	rm -rf ./node_modules ./tmp

.PHONY: dist ci jshint test test-ember-09 test-ember-1 npm_install clean clobber
