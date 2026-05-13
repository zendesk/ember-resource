# ember-resource

A JavaScript library for connecting Ember.js applications to JSON REST backends. It provides a schema-based resource model with identity mapping, lifecycle management, AJAX integration, and automatic cache expiry. Built with plain JavaScript (no ES modules), targeting browser environments via a Broccoli concatenation build.

## Setup & Commands

```bash
# Install dependencies
npm install

# Build distribution (concatenate + minify into dist/)
make dist

# Run full test suite (JSHint + both Ember variant runners)
make test

# Lint only
make jshint

# Full CI (build then test)
make ci

# Clean build artifacts
make clean

# Clean build artifacts and node_modules
make clobber
```

Browser tests (no CLI needed):
```
open spec/runner.html        # Ember 1.10.x runner
open spec/runner-next.html   # Ember 1.13.x runner
```

## Source Layout

```
src/
  vendor/lru.js          # LRU cache (vendored dependency)
  base.js                # Bootstraps Ember.Resource base class + version compat shims
  remote_expiry.js       # RemoteExpiry mixin — pub/sub push-transport expiry
  identity_map.js        # IdentityMap — LRU-backed per-class instance cache
  fetch.js               # AJAX layer wrapping $.ajax with Ember.run integration
  ember-resource.js      # Core: schema system, lifecycle, CRUD, ResourceCollection
  debug_adapter.js       # Ember Inspector (DataAdapter) integration
dist/                    # Build output — ember-resource.js + .min.js
spec/javascripts/        # Test files (*Spec.js, Mocha BDD)
spec/runner.html         # Browser test runner (Ember 1.10.x)
spec/runner-next.html    # Browser test runner (Ember 1.13.x)
vendor/                  # Vendored jQuery, Ember, Sinon for test runners
```

## Code Conventions

- **2-space indentation**; max line length 200 (enforced by `.jshintrc`)
- Wrap all source files in IIFEs: `(function(exports) { ... }(this))` — globals via `exports.Ember`
- Use `Ember.Object.extend(...)` and `reopenClass(...)` for the Ember object model
- Factory methods use `create(name, schema)` pattern — dispatch to subclass via `=== this` guard
- All AJAX through `Ember.Resource.ajax(options)` — never call `$.ajax` directly
- `camelCase` for functions and variables; `PascalCase` for constructors/classes
- Use `Ember.typeOf(obj)` for type checks; avoid `instanceof` on primitives
- Access properties via `getPath(instance, 'key')` and `set(instance, 'key', value)` for Ember compat
- Schemas declared as plain objects, expanded by `SchemaItem.create(name, schema)` factory

## Testing

- **Framework**: Mocha (BDD) + Chai (`expect`) + Sinon (stubs/fake XHR)
- **Location**: `spec/javascripts/*Spec.js` — one file per concern
- **Run CLI**: `make test` runs JSHint then both browser runners via `mocha-chrome`
- **Run in browser**: open `spec/runner.html` or `spec/runner-next.html`
- Tests must pass against both Ember 1.10.x and Ember 1.13.x runners
- New behaviour belongs in a new `*Spec.js` file; use `describe`/`it`/`beforeEach`/`afterEach`
- Use `sinon.useFakeXMLHttpRequest()` to intercept AJAX calls in tests

## Do

- Run `make jshint` before submitting — JSHint errors block the CI build
- Add tests in `spec/javascripts/` for every new feature or bug fix
- Keep `Ember.Resource.ajax` as the sole AJAX entry point; hooks like `errorHandler` rely on it
- Use `Ember.run` / `Em.run.next` when scheduling work that touches Ember's run-loop
- Always remove listeners in `willDestroy` to prevent memory leaks (see `remote_expiry.js`)
- Use the `identityMap` to return the same instance for the same resource ID
- Use `Ember.beginPropertyChanges()` / `Ember.endPropertyChanges()` around bulk mutations
- Preserve backward compatibility with Ember 1.x — test with both runners

## Don't

- Don't use ES modules, `import`, `require`, or CommonJS — the library runs in a plain browser `<script>` context
- Don't modify `dist/` files directly — regenerate via `make dist`
- Don't skip `make jshint` — undefined globals and style violations fail CI
- Don't call `$.ajax` directly — use `Ember.Resource.ajax`
- Don't add new vendor dependencies without updating both `Brocfile.js` and the spec `runner.html` files
- Don't break the `SchemaItem.create` factory dispatch pattern — subclass checks rely on `=== this`
- Don't set `resourceState` directly from outside the lifecycle machinery

## Architecture

See `ARCHITECTURE.md` for system architecture, component relationships, build pipeline, and design decisions.

## Security

See `SECURITY.md` for mandatory security requirements, prohibited patterns, and escalation triggers.

## Safety & Permissions

Allowed without approval:
- Read/list files
- Run `make jshint` on specific files
- Open test runners in a browser

Ask before:
- Installing or removing npm packages
- Deleting files or directories
- Modifying `Brocfile.js` or `Makefile`
- Modifying vendored files in `src/vendor/` or `vendor/`
- Pushing to remote branches

## PR & Commit Guidelines

- No strict title format required (see merged PR history for examples)
- Keep PRs focused; describe the change clearly in the PR body
- Run `make test` locally before submitting (CI uses `make ci`)
- See `CONTRIBUTING.md` for the full contribution workflow

## References

- Architecture: `ARCHITECTURE.md`
- Security: `SECURITY.md`
- Contributing: `CONTRIBUTING.md`
- JSHint config: `.jshintrc`
- Build pipeline: `Brocfile.js`, `Makefile`
