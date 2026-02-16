---
title: CSS Grid Layout Guide
created: 2024-10-05 11:20:45
updated: 2024-10-08 14:50:30
---

CSS Grid is a powerful layout system. Here's everything you need to get started.

## Basic Setup

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

This creates a 3-column grid with equal widths and 20px gaps.

## Defining Columns and Rows

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
}
```

| Unit | Description |
|------|-------------|
| `px` | Fixed pixel width |
| `fr` | Fraction of available space |
| `auto` | Size based on content |
| `%` | Percentage of container |

## Placing Items

```css
.item {
  grid-column: 1 / 3;  /* Span columns 1-2 */
  grid-row: 1 / 2;     /* First row only */
}

/* Shorthand */
.item {
  grid-area: 1 / 1 / 2 / 3;
}
```

## Named Grid Areas

```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

## Responsive Grid

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

This automatically adjusts column count based on available space.

## Alignment

```css
.container {
  /* Align all items */
  justify-items: center;  /* Horizontal */
  align-items: center;    /* Vertical */
}

.item {
  /* Align single item */
  justify-self: start;
  align-self: end;
}
```

## Grid vs Flexbox

- **Grid**: 2D layouts (rows AND columns)
- **Flexbox**: 1D layouts (row OR column)

Use Grid for page layouts, Flexbox for component layouts. They work great together!

