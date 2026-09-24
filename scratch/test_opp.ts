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
      if ((val.startsWith('\"') && val.endsWith('\"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      val = val.replace(/\\n/g, '\n');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

async function main() {
  const { matchRepo } = await import('../lib/db/repositories/matchRepo');
  const { projectRepo } = await import('../lib/db/repositories/projectRepo');
  const { vendorProfileRepo } = await import('../lib/db/repositories/vendorProfileRepo');
  const { sessionRepo } = await import('../lib/db/repositories/sessionRepo');
  const { buildVendorProjectSummary } = await import('../lib/matching/summary');

  try {
    const match = await matchRepo.get('qxZNfv4TA_x-');
    const project = await projectRepo.get(match.projectId);
    console.log('Project sessionId:', project.sessionId);
    const session = project.sessionId ? await sessionRepo.get(project.sessionId) : null;
    console.log('Session exists:', !!session);
    console.log('Building summary...');
    const summary = await buildVendorProjectSummary(project, session?.aiOutput ?? null, match.category, true);
    console.log('Summary built successfully:', summary);
  } catch (e) {
    console.error('ERROR in buildVendorProjectSummary:', e);
  }
  process.exit(0);
}

main().catch(console.error);
