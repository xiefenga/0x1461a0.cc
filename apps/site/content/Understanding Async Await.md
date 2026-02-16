---
title: Understanding Async Await
created: 2024-11-20 16:30:00
updated: 2024-11-22 09:15:20
---

A quick guide to understanding async/await in JavaScript.

## The Problem

JavaScript is single-threaded. Without async patterns, blocking operations would freeze your entire application.

```javascript
// This would block everything
const data = fetchDataSync(); // ❌ Bad
console.log(data);
```

## Callbacks (The Old Way)

```javascript
fetchData(function(error, data) {
  if (error) {
    console.error(error);
    return;
  }
  processData(data, function(error, result) {
    // Callback hell begins...
  });
});
```

## Promises (Better)

```javascript
fetchData()
  .then(data => processData(data))
  .then(result => saveResult(result))
  .catch(error => console.error(error));
```

## Async/Await (Best)

```javascript
async function handleData() {
  try {
    const data = await fetchData();
    const result = await processData(data);
    await saveResult(result);
    console.log('Done!');
  } catch (error) {
    console.error(error);
  }
}
```

## Common Patterns

### Parallel Execution

```javascript
// Run multiple promises in parallel
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
```

### Sequential Execution

```javascript
// When order matters
for (const id of ids) {
  await processItem(id);
}
```

## Key Takeaways

| Concept | Description |
|---------|-------------|
| `async` | Marks a function as asynchronous |
| `await` | Pauses execution until promise resolves |
| `try/catch` | Handle errors in async functions |
| `Promise.all` | Run promises in parallel |

Remember: `await` can only be used inside `async` functions!

