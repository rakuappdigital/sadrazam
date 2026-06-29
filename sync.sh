#!/bin/bash
echo "📦 Web dosyaları kopyalanıyor..."
cp index.html style.css game.js sounds.js haptics.js translations.js www/
cp -r assets data www/
echo "🔄 Capacitor sync..."
./node_modules/.bin/cap sync ios
echo "🌐 Vercel deploy..."
vercel --prod --yes 2>&1 | grep -E "Aliased|Error|✓"
echo "✅ Hazır! Xcode'dan ⌘+R, web: https://sadrazam-web.vercel.app"
