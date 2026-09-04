import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');
const assetsDir = path.resolve(__dirname, '../src/assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const logoInPath = path.join(publicDir, 'logo-in.png');
fs.copyFileSync(logoInPath, path.join(assetsDir, 'logo-in.png'));

// Função para gerar um ícone quadrado com o logo oficial "IN"
async function createPwaIcon({ size, logoScale = 0.65, bgGrad = true, isMaskable = false, roundedCorner = 0 }) {
  // 1. Fundo com gradiente ou cor sólida
  const bgSvg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#160933" />
          <stop offset="50%" stop-color="#110826" />
          <stop offset="100%" stop-color="#0D0118" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#7B2CBF" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#7B2CBF" stop-opacity="0.0" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${roundedCorner}" fill="url(#bgGrad)" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.45}" fill="url(#glow)" />
    </svg>
  `;

  const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  // 2. Redimensionar o logo "IN" preservando aspect ratio
  const maxLogoW = Math.round(size * logoScale);
  const maxLogoH = Math.round(size * logoScale * (612 / 982));

  const resizedLogo = await sharp(logoInPath)
    .resize({
      width: maxLogoW,
      height: maxLogoH,
      fit: 'inside'
    })
    .png()
    .toBuffer();

  // 3. Compor o logo no centro exato do ícone
  const finalIcon = await sharp(bgBuffer)
    .composite([
      {
        input: resizedLogo,
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  return finalIcon;
}

async function run() {
  console.log('Gerando ícones PWA com o logotipo oficial IN do ÍNTEGRA...');

  // 1. pwa-192x192.png (Aumentado para destaque na tela inicial)
  const icon192 = await createPwaIcon({ size: 192, logoScale: 0.82, roundedCorner: 38 });
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
  console.log('✔ pwa-192x192.png gerado com logotipo oficial IN');

  // 2. pwa-512x512.png
  const icon512 = await createPwaIcon({ size: 512, logoScale: 0.82, roundedCorner: 96 });
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
  console.log('✔ pwa-512x512.png gerado com logotipo oficial IN');

  // 3. pwa-maskable-512x512.png (Safe zone de 62% para os launchers circulares/squircle do Android)
  const iconMaskable = await createPwaIcon({ size: 512, logoScale: 0.62, isMaskable: true, roundedCorner: 0 });
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);
  console.log('✔ pwa-maskable-512x512.png gerado com logotipo oficial IN');

  // 4. apple-touch-icon.png (180x180)
  const iconApple = await createPwaIcon({ size: 180, logoScale: 0.80, roundedCorner: 0 });
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), iconApple);
  console.log('✔ apple-touch-icon.png gerado com logotipo oficial IN');

  // 5. favicon.svg
  const faviconSvg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="14" fill="#110826" />
      <image href="/logo-in.png" x="6" y="12" width="52" height="40" />
    </svg>
  `;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  console.log('✔ favicon.svg gerado');

  console.log('Todos os ícones PWA foram atualizados com sucesso com o logotipo oficial!');
}

run().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});
