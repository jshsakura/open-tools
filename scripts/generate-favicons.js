const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
];

const svgContent = fs.readFileSync(path.join(__dirname, '../public/icon.svg'), 'utf-8');

sizes.forEach(({ name, size }) => {
  const buffer = Buffer.from(svgContent);
  sharp(buffer)
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, `../public/${name}`))
    .then(() => console.log(`Generated ${name}`))
    .catch(err => console.error(`Error generating ${name}:`, err));
});
