const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
// dotenvは実行時に必要となります
const dotenv = require('dotenv');

// 環境変数の読み込み (.env.local または .env)
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error('エラー: .env または .env.local ファイルが見つかりません。');
    process.exit(1);
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://akaruka.r-k.app'; // Google Cloud Consoleの設定と一致させる必要があります

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('エラー: GOOGLE_CLIENT_ID または GOOGLE_CLIENT_SECRET が環境変数に設定されていません。');
    process.exit(1);
}

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// 認証URLの生成
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // リフレッシュトークンを取得するために必須
    scope: SCOPES,
    prompt: 'consent', // 毎回同意画面を表示してリフレッシュトークンを確実に取得する
});

console.log('以下のURLにアクセスして、アプリを承認してください:');
console.log(authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('\n表示されたページからコードをコピーして、ここに貼り付けてください: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
        if (err) {
            return console.error('アクセストークンの取得中にエラーが発生しました:', err);
        }
        oAuth2Client.setCredentials(token);
        console.log('\nトークンの取得に成功しました！');
        console.log('--------------------------------------------------');
        console.log('Refresh Token:', token.refresh_token);
        console.log('--------------------------------------------------');
        console.log('\nこの Refresh Token を .env ファイルの GOOGLE_REFRESH_TOKEN に保存してください。');
    });
});
