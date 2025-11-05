# CI/CD & Quality Automation Guide

**Status:** Production-ready quality gates and automation

This document describes the comprehensive CI/CD pipeline and quality automation for OrchestratAI.

---

## Table of Contents

- [Local Quality Gates (Git Hooks)](#local-quality-gates-git-hooks)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Coverage & Quality Metrics](#coverage--quality-metrics)
- [Automation Summary](#automation-summary)
- [Quality Gate Requirements](#quality-gate-requirements)

---

## Local Quality Gates (Git Hooks)

### Pre-Commit Hook

Runs on every commit:

- **lint-staged**: Auto-formats changed files
- **ESLint** (frontend) + **Ruff** (backend): Lints only changed files
- **TypeScript + mypy**: Type checking
- **Smart detection**: Only checks relevant code (frontend/backend)

### Pre-Push Hook

Runs before push:

- **Full test suite** with coverage (80%+ required)
- **Production build verification**
- **Secret detection**: Prevents committing `.env` files
- **Full linting and type checking**
- **Smart detection**: Only runs checks for changed code paths

---

## GitHub Actions Workflows

### Full Stack CI

File: `.github/workflows/ci.yml`

**Triggers:**
- Every push and PR to `main`

**Backend Job:**
1. Ruff formatting check
2. mypy type checking
3. pytest with coverage report
4. Coverage uploaded to Codecov

**Frontend Job:**
1. ESLint linting
2. TypeScript type checking
3. Vitest unit tests with coverage
4. Next.js production build verification
5. Coverage uploaded to Codecov

**Features:**
- Parallel execution for speed
- Dependency caching (2-3x faster)
- Status check that fails if any job fails

### CodeQL Security Scanning

File: `.github/workflows/codeql.yml`

**Triggers:**
- Every push
- Every PR
- Weekly (Mondays at 9 AM)

**What it does:**
- Analyzes JavaScript/TypeScript and Python code
- Detects security vulnerabilities automatically
- Reports findings to GitHub Security tab
- Blocks PRs with critical security issues

**Scanned Languages:**
- JavaScript/TypeScript (frontend)
- Python (backend)

### Auto-Labeling

File: `.github/workflows/auto-label.yml`

**Triggers:**
- Every PR opened or updated

**Automatically adds labels based on changed files:**
- `frontend`: Changes in `orchestratai_client/`
- `backend`: Changes in `orchestratai_api/`
- `documentation`: Changes in `.md` files or `docs/`
- `tests`: Changes in test files
- `ci`: Changes in `.github/workflows/`
- `dependencies`: Changes in `package.json`, `pyproject.toml`, etc.
- `configuration`: Changes in config files

### Dependabot

File: `.github/dependabot.yml`

**Schedule:** Weekly (Mondays)

**Monitors:**
- Frontend dependencies (npm)
- Backend dependencies (pip)
- GitHub Actions versions

**Creates PRs for:**
- Security updates
- Version updates
- Dependency updates

---

## Coverage & Quality Metrics

### Test Coverage

- **Frontend:** 80%+ line coverage (enforced)
- **Backend:** 80%+ line coverage (enforced)
- **E2E:** Critical user flows covered
- **Codecov:** Real-time coverage tracking

### Code Quality

- **ESLint:** Frontend code linting
- **Ruff:** Backend code formatting and linting
- **TypeScript:** Strict mode enabled
- **mypy:** Python type checking
- **CodeQL:** Continuous security monitoring

### Build Verification

- **Frontend:** Next.js production build must succeed
- **Backend:** FastAPI app must start without errors
- **Docker:** Images must build successfully

---

## Automation Summary

### What's Fully Automated

- Code formatting (Prettier + Ruff)
- Linting (ESLint + Ruff)
- Type checking (TypeScript + mypy)
- Unit tests (Vitest + pytest)
- Integration tests (both frontend and backend)
- Build verification (Next.js production builds)
- Security scanning (CodeQL)
- Dependency updates (Dependabot)
- PR labeling (auto-labeler)
- Coverage tracking (Codecov)

### Manual Steps

- Code review and approval
- Deployment to production
- Release versioning and tagging

---

## Quality Gate Requirements

### For any code to be merged to `main`:

1. All pre-commit checks pass (local)
2. All pre-push checks pass (local)
3. GitHub Actions CI passes (all jobs green)
4. No CodeQL security alerts introduced
5. Test coverage ≥ 80%
6. No TypeScript/mypy type errors
7. No linting errors
8. Production build succeeds
9. At least one code review approval (if required)

---

## Bypassing Quality Gates

**Not recommended, but if absolutely necessary:**

### Skip pre-commit hook:
```bash
git commit --no-verify
```

### Skip pre-push hook:
```bash
git push --no-verify
```

**Warning:** GitHub Actions will still run and may fail the PR.

---

## Troubleshooting CI/CD Issues

### "Coverage decreased" error

**Solution:** Add tests to cover new code or mark as acceptable decrease in PR

### "Type check failed" error

**Solution:** Fix TypeScript/mypy errors or add type annotations

### "Linting errors" message

**Solution:** Run `bun run format` and `bun run lint --fix`

### "Build failed" error

**Solution:** Test build locally with `bun run build`

### Flaky E2E tests

**Solution:** Check for race conditions, add proper waits, or retry logic

---

## CI/CD Performance

### Build Times

- **Frontend build:** ~2-3 minutes
- **Backend tests:** ~1-2 minutes
- **Full CI pipeline:** ~3-5 minutes (parallel jobs)

### Caching Strategy

- **Bun dependencies:** Cached by GitHub Actions
- **Python dependencies:** Cached by GitHub Actions
- **Next.js build cache:** Cached between runs
- **Docker layers:** Cached locally

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Contributing Guide](../CONTRIBUTING.md)

---

**For more information on contributing and local development, see the [Contributing Guide](../CONTRIBUTING.md).**
