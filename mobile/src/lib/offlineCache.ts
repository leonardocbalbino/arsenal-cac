import { Directory, File, Paths } from 'expo-file-system';

const cacheDir = new Directory(Paths.document, 'cache');

function ensureDir() {
  if (!cacheDir.exists) cacheDir.create({ intermediates: true });
}

export async function saveCache<T>(key: string, data: T): Promise<void> {
  try {
    ensureDir();
    const file = new File(cacheDir, `${key}.json`);
    file.write(JSON.stringify(data));
  } catch {
    // cache best-effort; falha em salvar não deve quebrar a tela
  }
}

export async function loadCache<T>(key: string): Promise<T | null> {
  try {
    const file = new File(cacheDir, `${key}.json`);
    if (!file.exists) return null;
    return JSON.parse(file.textSync()) as T;
  } catch {
    return null;
  }
}
