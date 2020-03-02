DIST_JS = dist/ember-resource.js

BROCCOLI   = ./node_modules/broccoli-cli/bin/broccoli
JSHINT     = ./node_modules/jshint/bin/jshint
MOCHA-CHROME = ./node_modules/.bin/mocha-chrome

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

test-ember-current: jshint $(MOCHA-CHROME)
	$(MOCHA-CHROME) spec/runner.html

test-ember-next: jshint $(MOCHA-CHROME)
	$(MOCHA-CHROME) spec/runner-next.html

$(BROCCOLI): npm_install
$(JSHINT): npm_install
$(MOCHA-CHROME): npm_install

npm_install:
	npm install > /dev/null

clean:
	rm -rf ./dist

clobber: clean
	rm -rf ./node_modules ./tmp

.PHONY: dist ci jshint test test-ember-09 test-ember-1 npm_install clean clobber
