# Security baseline — v0.4

- Never accept a vehicle owner identifier from an unauthenticated request. The API derives it from the verified JWT subject.
- Passwords are hashed with bcryptjs; plaintext passwords must never be logged or returned.
- JWT access tokens expire after 15 minutes. Refresh-token rotation and revocation are not yet implemented.
- JWT secret must be unique, random, kept outside source control, and rotated through a planned key-management procedure.
- Database migrations are explicit; TypeORM schema synchronization is disabled.
- Vehicle records are queried with both resource ID and authenticated owner ID to prevent insecure direct object references.
- Use TLS, production CORS allowlists, rate limiting, email verification, MFA for privileged roles, audit logging, backups and security testing before public deployment.
- Development credentials in examples are placeholders only. Never deploy them.


## v0.6.0 baseline restoration (2026-11-02)
- Restored JSON API security headers, disabled Express x-powered-by, and explicit trusted-proxy opt-in.
- Restored allow-listed CORS origin parsing and restricted methods/headers.
- Restored mandatory DB_PASSWORD validation for all environments and retained stronger production checks.
- Restored configurable PostgreSQL TLS options.
- Restored CI PostgreSQL service, API typecheck, API build-output verification, and PostgreSQL integration-test job.
- Note: CI currently installs without a committed lockfile; deterministic dependency locking remains an outstanding release blocker.

## 1.2.0-dev.3 additions
- Login performs a bcrypt comparison even for unknown accounts (no account-enumeration timing signal); passwords are limited to 72 bytes (bcrypt's real limit).
- JWT verification pins HS256; database failures during authentication are reported as server errors, not as invalid tokens.
- Production configuration refuses a wildcard or localhost CORS allow-list and placeholder secrets at boot.
- Business changes and their audit rows are written in one transaction.
- Container runs as a non-root user; database, cache and API ports are bound to loopback by default in docker-compose.
- Still open: refresh-token rotation/revocation, account lockout/MFA, e-mail verification, distributed rate limiting.
