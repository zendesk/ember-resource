# AI Agent Security Standard

This document defines mandatory security principles and restrictions for all AI coding assistants operating in this repository. All AI agents must follow these requirements without exception.

**Authority:** Derived from [Zendesk Minimum Baseline Security Standard](https://docs.google.com/document/d/17GZ9TpjKCt6WCdw3yxL44Ra_YscbOBVnVkUVGgx5Hz0/) and internal security policies.

---

## Core Security Mandate

Security is a first-class requirement. Every code suggestion must be evaluated against these guidelines. If a request would result in insecure code:

1. **Stop** and flag the security concern
2. **Explain** why it's problematic
3. **Propose** a secure alternative

AI-generated code requires human review before merging.

---

## Absolute Prohibitions

AI agents must **NEVER** do the following:

### Secrets & Credentials
- Hardcode secrets, credentials, API keys, tokens, or passwords in source code
- Store secrets in version control (`.env` files, config with real values)
- Log, print, or expose secret values
- Expose credentials in URLs, logs, or error messages

### Security Controls
- Disable or weaken security controls (`verify=False`, `ALLOW_ALL` CORS, disabled auth)
- Bypass authentication or authorization checks
- Disable certificate validation
- Weaken password policies or MFA requirements

### Dangerous Code Patterns
- Generate SQL or shell commands using raw string interpolation from user input
- Use `eval()` or `Function()` with user-supplied input
- Implement custom cryptography
- Use deprecated algorithms (MD5, SHA-1, DES, RC4, ECB mode)

### Data Exposure
- Log sensitive data (PII, credentials, tokens, customer data)
- Expose stack traces or internal paths to end users
- Transmit sensitive data over unencrypted channels

---

## Required Security Patterns

### Secret Management

```javascript
// Correct: Read from environment or config injected at build time
var apiKey = window.AppConfig && window.AppConfig.apiKey;
```

```javascript
// NEVER: Hardcoded secrets in source
var apiKey = "sk-abc123XYZ";
```

### Input Handling

ember-resource passes data to the backend via `JSON.stringify(this.toJSON())` and reads responses via `updateWithApiData(json)`. When extending these:

```javascript
// Correct: Use schema-defined typed attributes; let the schema coerce values
schema: { name: String, count: Number }
```

```javascript
// NEVER: Build backend URLs from raw unvalidated user input
var url = '/users/' + userInput + '/data';
```

### AJAX Calls

```javascript
// Correct: All AJAX through Ember.Resource.ajax — error handlers and run-loop wrapping applied
Ember.Resource.ajax({ url: this.resourceURL(), type: 'GET' });
```

```javascript
// NEVER: Direct $.ajax calls that bypass the resource layer
$.ajax({ url: '/sensitive-endpoint', data: rawUserInput });
```

---

## Security Requirements by Domain

### Data Protection
- Classify sensitive data appropriately before storing in resource schemas
- Do not cache sensitive PII in the identity map without explicit need; set `useIdentityMap: false` for such resources
- Minimize data fetching — only define schema fields that are actually needed by the UI
- Do not log resource data objects that may contain PII

### Communication Security
- Use HTTPS for all API calls — no HTTP fallback
- Never disable certificate validation in any environment
- Validate server responses before merging into resource data

### Cryptography

| Use Case | Approved | Forbidden |
|----------|----------|-----------|
| Integrity hashing | SHA-256, SHA-3 | MD5, SHA-1 |
| Symmetric encryption | AES-256-GCM | DES, 3DES, AES-ECB |
| Asymmetric encryption | RSA-2048+, ECDSA | RSA < 2048 bits |
| TLS | TLS 1.2+ | SSLv2/3, TLS 1.0/1.1 |

### Error Handling
- Handle errors gracefully — no sensitive info in error messages surfaced to users
- Restrict detailed errors to internal logs
- The `errorHandler` hook on `Ember.Resource` is for logging/monitoring; do not expose raw server errors to users

---

## When to Stop and Escalate

Stop, explain the concern, and recommend involving Security if a task requires:

- Bypassing or weakening security controls
- Handling or storing production customer data
- Circumventing the AJAX layer to make direct HTTP calls
- Disabling certificate validation or encryption
- Using deprecated cryptographic algorithms
- Accessing production data without authorization
- Adding new external origins/endpoints that haven't been security-reviewed

---

## Security Testing

When generating features, include:

- Tests verifying that schema type coercion rejects unexpected types gracefully
- Tests that AJAX error paths do not expose sensitive data
- Tests confirming that resources with sensitive data do not end up in the identity map when `useIdentityMap: false`
- Negative test cases for unauthorized or malformed API responses

---

## References

- [Minimum Baseline Security Standard](https://docs.google.com/document/d/17GZ9TpjKCt6WCdw3yxL44Ra_YscbOBVnVkUVGgx5Hz0/)
- [Cryptography Standards](https://techmenu.zende.sk/standards/cryptography-standards/)
- [Unified JWT Standard](https://techmenu.zende.sk/standards/unified-jwt/)

---

**Questions?** Reach out to the Security team or file a ticket via the Security Engagement process.
