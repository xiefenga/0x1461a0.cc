---
title: Terminal Productivity Tips
created: 2023-11-12 16:45:00
updated: 2023-12-05 09:30:15
---

Speed up your workflow with these terminal tips and tricks.

## Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + A` | Go to line start |
| `Ctrl + E` | Go to line end |
| `Ctrl + U` | Clear line before cursor |
| `Ctrl + K` | Clear line after cursor |
| `Ctrl + W` | Delete word before cursor |
| `Ctrl + R` | Search command history |

## Directory Navigation

```bash
# Go back to previous directory
cd -

# Go to home directory
cd ~

# Make and enter directory
mkdir newdir && cd newdir

# Use pushd/popd for directory stack
pushd /some/path
popd
```

## Command History

```bash
# Repeat last command
!!

# Repeat last command with sudo
sudo !!

# Run command from history by number
!42

# Search history
history | grep "docker"
```

## Useful One-Liners

```bash
# Find large files
find . -size +100M -type f

# Count lines of code
find . -name "*.js" | xargs wc -l

# Watch file changes
watch -n 1 'ls -la'

# Monitor process
top -o cpu

# Check disk usage
du -sh *
```

## Text Processing

```bash
# Search in files
grep -r "pattern" .

# Replace in file
sed -i 's/old/new/g' file.txt

# Extract column
awk '{print $2}' file.txt

# Sort and unique
sort file.txt | uniq
```

## Process Management

```bash
# Run in background
command &

# Bring to foreground
fg

# List jobs
jobs

# Kill process
kill -9 PID
```

## My Favorite Aliases

```bash
# Add to ~/.zshrc or ~/.bashrc
alias ..='cd ..'
alias ...='cd ../..'
alias ll='ls -la'
alias g='git'
alias dc='docker-compose'
alias serve='python -m http.server 8000'
```

Master the terminal and you'll code faster!

