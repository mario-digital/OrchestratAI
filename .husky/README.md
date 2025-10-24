# Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality standards before commits and pushes.

## Hooks

### Pre-commit
Runs automatically before each commit:
- **lint-staged**: Formats and lints only staged files
- **Frontend checks** (if `my_flow_client/` files are staged):
  - ESLint
  - TypeScript type checking
- **Backend checks** (if `my_flow_api/` files are staged):
  - Ruff linting
  - mypy type checking

### Pre-push
Runs automatically before each push:
- **Blocks direct pushes to `main` branch** ⛔
  - Forces you to create a feature branch and PR instead
- **Git hygiene checks**:
  - Prevents pushing `.env` files
- **Frontend checks** (if `my_flow_client/` files changed):
  - ESLint
  - TypeScript type checking
  - Tests with coverage
  - Production build verification
- **Backend checks** (if `my_flow_api/` files changed):
  - Ruff linting
  - mypy type checking
  - pytest tests

## Setup

After cloning the repository, install dependencies:

```bash
bun install
```

This will automatically set up Husky via the `prepare` script.

## Bypassing Hooks (Use with Caution)

If you absolutely must bypass hooks (not recommended):

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

**Note**: CI/CD will still enforce all checks, so bypassing hooks locally will likely result in failed builds.

## Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit (pre-commit hook runs automatically)
3. Push to your branch (pre-push hook runs automatically)
4. Create a Pull Request on GitHub
5. CI/CD will run all checks before allowing merge to `main`
