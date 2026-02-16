---
title: Setting Up ESLint and Prettier
created: 2023-02-18 13:15:00
updated: 2023-03-01 10:40:30
---

Keep your code consistent with ESLint and Prettier. Here's how to set them up.

## Installation

```bash
npm install -D eslint prettier eslint-config-prettier
```

## ESLint Configuration

Create `.eslintrc.json`:

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

## Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

## Ignore Files

`.eslintignore`:

```
node_modules/
dist/
build/
```

`.prettierignore`:

```
node_modules/
dist/
build/
package-lock.json
```

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## VS Code Integration

Install extensions:
- ESLint
- Prettier - Code formatter

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## For TypeScript

```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Update `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ]
}
```

## Pre-commit Hook

Use lint-staged with husky:

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

Now your code will be automatically formatted on every commit!

