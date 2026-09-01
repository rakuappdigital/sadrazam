// Bu dosya build zamanında esbuild ile tek bir statik dosyaya paketlenir
// (bkz: build-revenuecat.sh). Proje hiçbir bundler kullanmadığı için
// RevenueCat'in ES module paketini tarayıcıda doğrudan <script> ile
// çalışacak, window.RevenueCatPurchases global'ine bağlanan bir IIFE'ye
// çeviriyoruz. game.js bu global'i kullanır.
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
window.RevenueCatPurchases = Purchases;
window.RevenueCatLogLevel = LOG_LEVEL;
