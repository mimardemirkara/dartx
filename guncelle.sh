#!/usr/bin/env bash
# DartX web yayınını günceller: ../DartX'teki dosyaları kopyalar, commit + push (GitHub Pages)
set -e
Y="$(cd "$(dirname "$0")" && pwd)"; K="$Y/../DartX"
rm -rf "$Y/css" "$Y/js" "$Y/img" "$Y/icons" "$Y/ses"
cp -r "$K"/{index.html,manifest.webmanifest,sw.js,css,js,img,icons,ses} "$Y/"
rm -rf "$Y/img/karakter/kaynak"; find "$Y" -name "*.md" ! -name README.md -delete
cd "$Y"; git add -A
git -c user.name="Demir Kara" -c user.email="demirkaramimar@gmail.com" commit -q -m "${1:-DartX güncellemesi}

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q
git log --oneline | head -1
