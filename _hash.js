// Generate the hash with the same algorithm as Web Crypto API TextEncoder
const crypto = require('crypto');
const data = Buffer.from('cLe4nPr0_s4lt_2024redrabbit34', 'utf-8');
const hash = crypto.createHash('sha256').update(data).digest('hex');
const fs = require('fs');
fs.writeFileSync('_hash_result.txt', hash);
