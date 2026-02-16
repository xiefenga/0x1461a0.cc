---
title: Weekend Project Ideas
created: 2025-12-15 20:45:00
updated: 2025-12-16 08:30:15
---

Looking for something to do this weekend? Here are some fun project ideas.

## Frontend Projects

### 1. Personal Portfolio Website

Build a site to showcase your work using your favorite tech stack.

```html
<section class="portfolio">
  <h2>My Work</h2>
  <div class="grid">
    <article class="project-card">
      <img src="/images/project1.png" alt="Project screenshot">
      <h3>Project Name</h3>
      <p>Brief description...</p>
    </article>
  </div>
</section>
```

### 2. Weather App

Call a free weather API to build a clean weather lookup app.

```javascript
async function getWeather(city) {
  const res = await fetch(`https://api.weather.com/${city}`);
  const data = await res.json();
  return data;
}
```

## Backend Projects

### 3. URL Shortener Service

Build a simple link shortener:

- Accept long URLs
- Generate short codes
- Handle redirects

### 4. Todo API

Classic todo list API to practice CRUD operations:

| Method | Path | Description |
|--------|------|-------------|
| GET | /todos | List all todos |
| POST | /todos | Create a todo |
| PUT | /todos/:id | Update a todo |
| DELETE | /todos/:id | Delete a todo |

## More Ideas

- 🎮 Build a game with Canvas
- 🤖 Create a Discord/Telegram bot
- 📊 Data visualization Dashboard
- 🎨 CSS art piece

## Tips

> Don't aim for perfection. First make it work, then make it better.

Weekend projects are about **learning and fun**. Pick something interesting and start building!
