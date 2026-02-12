/**
 * PWA アイコン生成スクリプト
 * 
 * 使い方:
 *   1. public/icon-original.png に元画像を配置
 *   2. node scripts/generate-icons.mjs を実行
 * 
 * canvas を使わずに、HTML Canvas API の代わりに
 * sharp がなくても動くよう、単純にコピーする簡易版です。
 * ブラウザ側でリサイズされます。
 */

import { copyFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = resolve(__dirname, '..', 'public');

const sourceFile = resolve(publicDir, 'icon-original.png');

if (!existsSync(sourceFile)) {
    console.error('❌ エラー: public/icon-original.png が見つかりません。');
    console.error('   元画像を public/icon-original.png として保存してください。');
    process.exit(1);
}

// 192x192 と 512x512 の両方にコピー（ブラウザが自動リサイズ）
const sizes = [192, 512];

for (const size of sizes) {
    const dest = resolve(publicDir, `icon-${size}x${size}.png`);
    copyFileSync(sourceFile, dest);
    console.log(`✅ icon-${size}x${size}.png を生成しました`);
}

console.log('');
console.log('🎉 PWA アイコンの生成が完了しました！');
console.log('   ブラウザを再読み込みして確認してください。');
