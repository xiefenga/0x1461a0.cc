---
title: Getting Started with TypeScript
created: 2024-08-15 10:30:00
updated: 2024-08-20 14:45:22
---

TypeScript adds static typing to JavaScript. Here's how to get started.

## Why TypeScript?

- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code
- Safer refactoring

## Installation

```bash
npm install -g typescript
tsc --version
```

## Basic Types

```typescript
// Primitives
let name: string = "Alice";
let age: number = 25;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Objects
let user: { name: string; age: number } = {
  name: "Alice",
  age: 25
};
```

## Interfaces

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}
```

## Type Aliases

```typescript
type ID = string | number;
type Status = "pending" | "approved" | "rejected";

function processOrder(id: ID, status: Status) {
  // ...
}
```

## Generics

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const num = identity<number>(42);
const str = identity<string>("hello");
```

## Common Patterns

| Pattern | Example |
|---------|---------|
| Union Types | `string \| number` |
| Intersection | `TypeA & TypeB` |
| Type Guards | `typeof x === "string"` |
| Non-null assertion | `value!` |

## Quick Tips

1. Start with `strict: true` in tsconfig
2. Let TypeScript infer types when obvious
3. Use interfaces for object shapes
4. Avoid `any` — use `unknown` instead

TypeScript takes time to learn, but the benefits are worth it!

