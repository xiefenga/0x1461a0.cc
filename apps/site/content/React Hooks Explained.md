---
title: React Hooks Explained
created: 2025-01-08 14:20:00
updated: 2025-01-15 11:05:30
---

React Hooks let you use state and lifecycle features in function components.

## useState

Manage local state:

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

## useEffect

Handle side effects:

```jsx
import { useEffect, useState } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]); // Runs when userId changes

  return <div>{user?.name}</div>;
}
```

## useContext

Access context without nesting:

```jsx
const ThemeContext = createContext("light");

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

## useRef

Access DOM elements or persist values:

```jsx
function TextInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
```

## useMemo & useCallback

Optimize performance:

```jsx
// Memoize expensive computation
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callback function
const handleClick = useCallback(() => {
  console.log("Clicked:", id);
}, [id]);
```

## Custom Hooks

Extract reusable logic:

```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage("theme", "dark");
```

## Rules of Hooks

1. Only call hooks at the top level
2. Only call hooks from React functions
3. Name custom hooks starting with `use`

Hooks make React code cleaner and more reusable!
