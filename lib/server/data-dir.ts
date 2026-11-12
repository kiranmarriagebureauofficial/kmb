import path from 'path';

/**
 * Resolves a persistent data directory for server-side auth storage.
 * Outside Hostinger's ephemeral `hbuilds/versions/...` folders so redeploys never wipe accounts.
 */
export function getPersistentDataDir(): string {
  const customDir = process.env.AUTH_DATA_DIR?.trim();
  if (customDir) {
    return path.resolve(customDir);
  }

  const cwd = process.cwd();
  const hbuildsMarker = `${path.sep}hbuilds${path.sep}`;
  const idx = cwd.indexOf(hbuildsMarker);
  if (idx !== -1) {
    return path.join(cwd.slice(0, idx), 'kmb-persistent-data');
  }

  return path.join(cwd, 'data');
}

