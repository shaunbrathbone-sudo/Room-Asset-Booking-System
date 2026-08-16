const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, 'src', 'app', 'admin', 'offices', '[slug]', 'floor-editor', 'page.tsx');
fs.mkdirSync(path.dirname(target), { recursive: true });
