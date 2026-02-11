# Contributing to BhaadShurakshaDal

Thank you for your interest in contributing to BhaadShurakshaDal! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/REPO_NAME.git`
3. Create a new branch following our naming convention
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## Branch Naming Convention

We follow a structured Git branch naming pattern:

- `feature/<name>` - for new features
- `fix/<name>` - for bug fixes
- `chore/<name>` - for configuration or maintenance
- `docs/<name>` - for documentation updates

### Examples

- `feature/sms-notification`
- `fix/alert-timing-issue`
- `chore/update-dependencies`
- `docs/api-documentation`

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation Steps

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:

```bash
npm run db:migrate
```

5. Seed the database:

```bash
npm run db:seed
```

6. Start development server:

```bash
npm run dev
```

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible

### Code Style

- We use Prettier for formatting
- ESLint for linting
- Run `npm run format` before committing
- Run `npm run lint` to check for issues

### Commit Messages

Follow conventional commit format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Adding tests

Example: `feat: add SMS notification for critical alerts`

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test edge cases and error scenarios

## Pull Request Process

1. Update documentation if needed
2. Ensure your code follows our style guidelines
3. Make sure all tests pass
4. Update the README.md if you're adding new features
5. Request review from maintainers
6. Address review comments promptly

## Database Changes

If your PR includes database schema changes:

1. Create a new Prisma migration:

```bash
npx prisma migrate dev --name your_migration_name
```

2. Update seed data if necessary
3. Document the changes in your PR description

## API Changes

If you're modifying or adding API endpoints:

1. Follow RESTful conventions
2. Add proper error handling
3. Validate input using Zod schemas
4. Document the endpoint in API documentation
5. Test with different scenarios

## Questions?

Feel free to open an issue for:

- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
