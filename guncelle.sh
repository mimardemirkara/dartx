#!/usr/bin/env bash
# DartX web yayınını günceller: ../DartX'teki dosyaları kopyalar, commit + push (GitHub Pages)
set -e
Y="$(cd "$(dirname "$0")" && pwd)"; K="$Y/../DartX"
# Demir 10.11: her yayında derleme numarası 1 artar (uygulamada "1.1 Beta · Derleme N"), sw.js sürümü de ona uyar
N=$(( $(grep -o '[0-9]\+' "$K/js/derleme.js" | tail -1) + 1 ))
sed -i "s/export const DERLEME = [0-9]*;/export const DERLEME = $N;/" "$K/js/derleme.js"
sed -i "s/const VERSION = 'dartx-[^']*';/const VERSION = 'dartx-b$N';/" "$K/sw.js"
echo "Derleme $N"
rm -rf "$Y/css" "$Y/js" "$Y/img" "$Y/icons" "$Y/ses"
cp -r "$K"/{index.html,kamera.html,gizlilik.html,destek.html,manifest.webmanifest,sw.js,css,js,img,icons,ses} "$Y/"
rm -rf "$Y/img/karakter/kaynak"; find "$Y" -name "*.md" ! -name README.md -delete
cd "$Y"; git add -A
git -c user.name="Demir Kara" -c user.email="demirkaramimar@gmail.com" commit -q -m "${1:-DartX güncellemesi}

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q
git log --oneline | head -1
# Demir 09.11.2026: "her şeyi bilgisayara kaydet" — yayınla birlikte ../DartX projesi de kaydedilir (git commit, push yok)
cd "$K"; git add -A
git -c user.name="Demir Kara" -c user.email="demirkaramimar@gmail.com" commit -q -m "${1:-DartX güncellemesi} (Derleme $N)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && echo "Kayıt: $(git log --oneline | head -1)" || echo "Kayıt: değişiklik yok"
