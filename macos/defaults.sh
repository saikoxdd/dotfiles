#!/bin/bash
# Системные настройки night-сетапа
defaults write -g AppleAccentColor -int 5                                   # фиолетовый акцент
defaults write -g AppleHighlightColor "0.968627 0.831373 1.000000 Purple"
defaults write -g KeyRepeat -int 2                                          # быстрый повтор клавиш
defaults write -g InitialKeyRepeat -int 15
defaults write com.apple.dock autohide -bool false
defaults write com.apple.dock autohide-delay -float 0
defaults write com.apple.dock autohide-time-modifier -float 0.3
mkdir -p ~/Pictures/Screenshots
defaults write com.apple.screencapture location ~/Pictures/Screenshots
killall Dock SystemUIServer 2>/dev/null || true
