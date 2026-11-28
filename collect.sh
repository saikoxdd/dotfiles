#!/bin/bash
# Собирает актуальные конфиги с этого мака в репозиторий и проверяет их на секреты.
set -euo pipefail
cd "$(dirname "$0")"
# calm подменяет виджеты, starship, ghostty и gaps - собираем всегда в night и потом возвращаем тему
PREV=$(cat ~/.config/theme/current 2>/dev/null || echo night)
if [ "$PREV" != night ]; then bin/theme night >/dev/null; trap 'bin/theme "$PREV" >/dev/null' EXIT; fi
echo "✦ собираю конфиги..."
S="$HOME/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/night.js"
[ -f "$S" ] && mkdir -p ios && cp "$S" ios/night.js
cp ~/.config/ghostty/config ghostty/config
[ -d ~/.config/ghostty/themes ] && cp ~/.config/ghostty/themes/* ghostty/themes/ 2>/dev/null || true
mkdir -p starship zsh
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
