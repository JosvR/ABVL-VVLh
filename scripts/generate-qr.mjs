import QRCode from 'qrcode';

const url = 'https://josvr.github.io/ABVL-VVLh/';
const options = { width: 1000, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#122b3b', light: '#ffffff' } };
await QRCode.toFile('public/hijsinzicht-qr.png', url, options);
await QRCode.toFile('public/hijsinzicht-qr.svg', url, { ...options, type: 'svg' });
console.log(`QR-code opgeslagen voor ${url}`);
console.log('Download de bijbehorende presentatiedia via Delen & QR-code in de app.');
