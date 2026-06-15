const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/b2b_db';

const productSchema = new mongoose.Schema({
  title: String,
  priceNumber: Number,
  priceText: String,
  image: String,
  description: String,
  category: String,
  sourceFile: String
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

function parsePrice(priceText) {
  if (!priceText) return null;
  const cleaned = priceText.replace(/[₹,\s]/g, '').replace(/[^0-9.]/g, '');
  const m = cleaned.match(/[0-9]+(?:\.[0-9]+)?/);
  return m ? parseFloat(m[0]) : null;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB:', MONGODB_URI);

  const indexPath = path.resolve(__dirname, '..', 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found at', indexPath);
    await mongoose.disconnect();
    process.exit(1);
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const $ = cheerio.load(html);

  const items = [];
  $('.small-card').each((i, el) => {
    const $el = $(el);
    const title = ($el.attr('data-title') || $el.find('p').first().text() || '').trim();
    const priceText = ($el.attr('data-price') || $el.find('.price').text() || '').trim();
    const image = ($el.attr('data-image') || $el.find('img').attr('src') || '').trim();
    const description = $el.find('p').first().text().trim();
    const category = $el.closest('.category-section').find('h2').first().text().trim() || null;
    const priceNumber = parsePrice(priceText);

    if (title) {
      items.push({ title, priceNumber, priceText, image, description, category, sourceFile: 'index.html' });
    }
  });

  if (!items.length) {
    console.log('No product items found in index.html');
    await mongoose.disconnect();
    return;
  }

  const ops = items.map(it => ({
    updateOne: {
      filter: { title: it.title, image: it.image },
      update: { $set: it },
      upsert: true
    }
  }));

  const res = await Product.bulkWrite(ops);
  console.log('BulkWrite result:', res);
  console.log('Seeded', items.length, 'items (upserted/modified accordingly).');

  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
