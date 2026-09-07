# Security Policy — PathFinder AI

The PathFinder AI project takes security, data privacy, and safe AI engineering seriously. This document outlines our supported versions, vulnerability reporting process, and security architecture guidelines.

---

## 🛡️ Supported Versions

We actively maintain and provide security patches for the following versions:

| Version | Supported          | Status |
| :--- | :--- | :--- |
| `1.0.x` (Current Main) | :white_check_mark: | Active Security Updates |
| `< 1.0` | :x: | End of Life |

---

## 🔒 Reporting a Vulnerability

If you discover a security vulnerability or potential threat in PathFinder AI, please **do not open a public issue**. Instead, follow responsible disclosure procedures:

1. **Email Disclosure**: Send an encrypted or private email to **security@pathfinder.ai** (or open a private security advisory on GitHub via the **Security** tab).
2. **Include Key Details**:
   - Description and location of the vulnerability.
   - Proof of concept (PoC) or reproduction steps.
   - Potential impact on learner profiles or AI pipeline integrity.
3. **Response Timeline**:
   - **Initial Acknowledgement**: Within 24–48 hours.
   - **Triage & Status Assessment**: Within 5 business days.
   - **Patch Release & Advisory Publication**: Coordinated with the reporter.

---

## 🔐 Security & Privacy Architecture

PathFinder AI incorporates multiple layers of security across its client, server, and AI orchestration engines:

### 1. API & Input Validation
- **Strict Pydantic v2 Schemas**: All API inputs and payloads are strictly validated before execution.
- **SQL Injection Prevention**: Built entirely with SQLAlchemy 2.0 ORM using parameterized queries.
- **CORS Configuration**: Restrictive Cross-Origin Resource Sharing (CORS) policies protecting endpoints from unauthorized origins.

### 2. Environment Variables & Secret Protection
- **Zero Committed Secrets**: `.env` files, API keys, and local SQLite databases are strictly excluded via `.gitignore`.
- **Credential Safety**: All external API credentials (such as Google Gemini keys) are read exclusively from runtime environment variables.

### 3. AI Safety & Prompt Defense
- **Prompt Grounding**: AI requests are grounded strictly with verified learner context, preventing hallucinated access.
- **Zero Arbitrary Code Execution**: No user prompt or AI response is ever executed via `eval()`, `exec()`, or unsafe shell commands.
- **Fault-Tolerant Heuristic Fallbacks**: In the event of API rate limits or anomalous responses, the system gracefully falls back to deterministic local rule engines.

### 4. Client Data & Local Storage
- **Learner Profile Integrity**: Local and database state transactions enforce foreign key constraints with safe cascading deletions.

---

## 📜 Acknowledgement & Hall of Fame

We sincerely appreciate security researchers and contributors who responsibly disclose vulnerabilities to keep PathFinder AI secure for learners worldwide.
