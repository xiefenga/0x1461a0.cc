---
title: Git Commands Cheatsheet
created: 2024-09-18 08:45:00
updated: 2024-12-01 17:20:10
---

A quick reference for the Git commands I use most often.

## Setup

```bash
# Configure user info
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Initialize a new repo
git init

# Clone existing repo
git clone https://github.com/user/repo.git
```

## Daily Workflow

```bash
# Check status
git status

# Stage changes
git add .                    # All files
git add filename.js          # Specific file

# Commit
git commit -m "feat: add new feature"

# Push to remote
git push origin main
```

## Branching

```bash
# Create and switch to new branch
git checkout -b feature/new-thing

# Switch branches
git checkout main

# List branches
git branch -a

# Delete branch
git branch -d feature/old-thing
```

## Merging & Rebasing

```bash
# Merge branch into current
git merge feature/new-thing

# Rebase current branch
git rebase main

# Interactive rebase (squash commits)
git rebase -i HEAD~3
```

## Undoing Things

| Command | What it does |
|---------|--------------|
| `git reset HEAD~1` | Undo last commit (keep changes) |
| `git reset --hard HEAD~1` | Undo last commit (discard changes) |
| `git checkout -- file.js` | Discard changes in file |
| `git stash` | Temporarily save changes |
| `git stash pop` | Restore stashed changes |

## Viewing History

```bash
# View commit history
git log --oneline

# Show changes in commit
git show abc1234

# Compare branches
git diff main..feature/branch
```

## Useful Aliases

Add these to your `.gitconfig`:

```ini
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  lg = log --oneline --graph --all
```

## Pro Tips

1. Write meaningful commit messages
2. Commit often, push regularly
3. Use branches for features
4. Review changes before committing with `git diff`

> "Commit early, commit often" — Every developer ever

