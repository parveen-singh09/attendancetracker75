import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wranglerJsonPath = path.resolve(__dirname, '../dist/server/wrangler.json');

if (fs.existsSync(wranglerJsonPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(wranglerJsonPath, 'utf8'));
    
    // Remove conflicting ASSETS binding for Pages
    if (data.assets) {
      delete data.assets;
      console.log('Successfully removed "assets" binding to prevent Pages conflict.');
    }
    
    // Remove unused SESSION KV namespace that lacks an ID
    if (data.kv_namespaces) {
      delete data.kv_namespaces;
      console.log('Successfully removed "kv_namespaces" binding.');
    }
    
    fs.writeFileSync(wranglerJsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully patched wrangler.json for Cloudflare Pages.');
  } catch (err) {
    console.error('Error patching wrangler.json:', err);
  }
} else {
  console.warn(`wrangler.json not found at ${wranglerJsonPath}, skipping patch.`);
}
