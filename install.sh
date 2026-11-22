#!/bin/bash
# Ставит night-сетап на чистый мак.
set -euo pipefail
cd "$(dirname "$0")"; D="$PWD"
echo "✦ night · dotfiles"

command -v brew >/dev/null || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
[ -f Brewfile ] && brew bundle --file="$D/Brewfile" || true

link() { mkdir -p "$(dirname "$2")"
  if [ -e "$2" ] && [ ! -L "$2" ]; then mv "$2" "$2.bak.$(date +%s)"; fi
  ln -sfn "$1" "$2"; echo "  ↳ $2"; }

echo "✦ конфиги"
link "$D/ghostty/config"         ~/.config/ghostty/config
link "$D/ghostty/themes"         ~/.config/ghostty/themes
link "$D/starship/starship.toml" ~/.config/starship.toml
link "$D/zsh/.zshrc"             ~/.zshrc
[ -f aerospace/.aerospace.toml ] && link "$D/aerospace/.aerospace.toml" ~/.aerospace.toml

echo "✦ виджеты Übersicht"
W="$HOME/Library/Application Support/Übersicht/widgets"; mkdir -p "$W"
cp -f ubersicht/widgets/*.jsx "$W/"

echo "✦ обои"
mkdir -p ~/Pictures/Wallpapers && cp -f wallpapers/*.png ~/Pictures/Wallpapers/
osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$HOME/Pictures/Wallpapers/saiko-night.png\"" || true

echo "✦ настройки macOS"
bash macos/defaults.sh

echo
echo "Осталось руками (см. README):"
echo "  • Mousecape → File → Import Cape → cursors/night-68.cape → Apply"
echo "  • Login Items: Übersicht, AltTab, Raycast, Shottr"
echo "  • Appearance → Icon & widget style"
