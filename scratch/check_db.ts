import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      val = val.replace(/\\n/g, '\n');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

async function main() {
  const { vendorProfileRepo } = await import('../lib/db/repositories/vendorProfileRepo');
  const vendors = await vendorProfileRepo.list();
  for (const v of vendors) {
    console.log(v.companyName, 'portfolio videos:', v.portfolio?.videos);
  }
  process.exit(0);
}

main().catch(console.error);
