#!/bin/bash
# Собирает актуальные конфиги с этого мака в репозиторий и проверяет их на секреты.
set -euo pipefail
cd "$(dirname "$0")"
echo "✦ собираю конфиги..."
cp ~/.config/ghostty/config ghostty/config
[ -d ~/.config/ghostty/themes ] && cp ~/.config/ghostty/themes/* ghostty/themes/ 2>/dev/null || true
cp ~/.config/starship.toml starship/starship.toml
cp ~/.zshrc zsh/.zshrc
[ -f ~/.aerospace.toml ] && mkdir -p aerospace && cp ~/.aerospace.toml aerospace/.aerospace.toml
W="$HOME/Library/Application Support/Übersicht/widgets"
[ -d "$W" ] && cp "$W"/*.jsx ubersicht/widgets/ 2>/dev/null || true
brew bundle dump --file=Brewfile --force
echo "✦ проверяю на секреты..."
if grep -nEi '(token|secret|api[_-]?key|password|passwd|bearer|ghp_|sk-[a-z0-9]{10,})' \
     zsh/.zshrc starship/starship.toml ghostty/config aerospace/.aerospace.toml 2>/dev/null; then
  echo
  echo "⚠️  Выше строки, похожие на ключи или пароли. Убери их из файлов в репо (или вынеси в ~/.zshrc.local) и запусти collect.sh ещё раз."
  exit 1
fi
echo "✓ готово, секретов не найдено"
