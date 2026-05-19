const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, 'Documentos', 'PROCEDIMENTO OPERACIONAL.docx'));

// Extract readable text from docx (XML inside ZIP)
const str = buf.toString('binary');

// Look for XML text content between tags
const xmlMatches = str.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
const texts = xmlMatches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 1);

console.log(texts.join('\n'));
