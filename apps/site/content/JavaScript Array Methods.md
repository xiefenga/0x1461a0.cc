---
title: JavaScript Array Methods
created: 2023-04-10 08:30:00
updated: 2023-04-15 12:45:20
---

Master these array methods to write cleaner JavaScript code.

## Transformation Methods

### map()

Transform each element:

```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8]
```

### filter()

Keep elements that pass a test:

```javascript
const numbers = [1, 2, 3, 4, 5];
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]
```

### reduce()

Accumulate values:

```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 10
```

## Search Methods

### find()

Find first matching element:

```javascript
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];
const user = users.find(u => u.id === 2);
// { id: 2, name: 'Bob' }
```

### findIndex()

Find index of first match:

```javascript
const index = users.findIndex(u => u.name === 'Bob');
// 1
```

### includes()

Check if element exists:

```javascript
const fruits = ['apple', 'banana', 'orange'];
fruits.includes('banana'); // true
```

## Testing Methods

### every()

Check if ALL elements pass:

```javascript
const numbers = [2, 4, 6, 8];
numbers.every(n => n % 2 === 0); // true
```

### some()

Check if ANY element passes:

```javascript
const numbers = [1, 2, 3, 4];
numbers.some(n => n > 3); // true
```

## Sorting & Reversing

```javascript
const names = ['Charlie', 'Alice', 'Bob'];
names.sort(); // ['Alice', 'Bob', 'Charlie']

const numbers = [3, 1, 4, 1, 5];
numbers.sort((a, b) => a - b); // [1, 1, 3, 4, 5]
numbers.sort((a, b) => b - a); // [5, 4, 3, 1, 1]

[1, 2, 3].reverse(); // [3, 2, 1]
```

## Flattening

```javascript
const nested = [[1, 2], [3, 4], [5]];
nested.flat(); // [1, 2, 3, 4, 5]

const deep = [[1, [2, [3]]]];
deep.flat(2); // [1, 2, [3]]
deep.flat(Infinity); // [1, 2, 3]
```

## Chaining Methods

```javascript
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 30 }
];

const adultNames = users
  .filter(u => u.age >= 18)
  .map(u => u.name)
  .sort();
// ['Alice', 'Charlie']
```

## Quick Reference

| Method | Returns | Mutates? |
|--------|---------|----------|
| map | New array | No |
| filter | New array | No |
| reduce | Single value | No |
| find | Element or undefined | No |
| sort | Same array | Yes |
| reverse | Same array | Yes |
| push/pop | Length/Element | Yes |

Use these methods to write more declarative, readable code!

