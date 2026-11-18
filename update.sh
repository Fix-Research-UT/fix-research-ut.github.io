#!/bin/zsh
# One-command site update:  ./update.sh "what you changed"
cd "$(dirname "$0")" || exit 1
git add -A
git commit -m "${1:-Update site}" || echo "No changes to commit."
git push
