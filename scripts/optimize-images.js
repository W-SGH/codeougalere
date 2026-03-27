// Script de compression des images testimonials
// Usage : node scripts/optimize-images.js
import sharp from 'sharp';
import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const dir = './public/testimonials';

const files = readdirSync(dir).filter(f =>
  /\.(jpe?g|png)$/i.test(f)
);

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const input = join(dir, file);
  const sizeBefore = statSync(input).size;
  totalBefore += sizeBefore;

  const ext = extname(file).toLowerCase();
  const tmp = input + '.tmp';

  if (ext === '.png') {
    await sharp(input).png({ compressionLevel: 9, quality: 80 }).toFile(tmp);
  } else {
    await sharp(input).jpeg({ quality: 72, progressive: true, mozjpeg: true }).toFile(tmp);
  }

  const sizeAfter = statSync(tmp).size;
  totalAfter += sizeAfter;

  // Remplacer seulement si on a gagné de la place
  if (sizeAfter < sizeBefore) {
    import('fs').then(fs => fs.renameSync(tmp, input));
    const saving = Math.round((1 - sizeAfter / sizeBefore) * 100);
    console.log(`✓ ${file} : ${kb(sizeBefore)} → ${kb(sizeAfter)} (−${saving}%)`);
  } else {
    import('fs').then(fs => fs.unlinkSync(tmp));
    console.log(`= ${file} : déjà optimisé`);
  }
}

console.log(`\nTotal : ${kb(totalBefore)} → ${kb(totalAfter)} (−${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);

function kb(bytes) {
  return (bytes / 1024).toFixed(0) + ' KB';
}
