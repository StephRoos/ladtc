import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

/** Base directory for uploaded files — mapped to a Docker volume in production. */
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/** Public URL prefix for uploaded files. */
const UPLOAD_URL_PREFIX = "/uploads";

interface UploadResult {
  url: string;
  pathname: string;
}

/**
 * Store a file on the local filesystem under public/uploads/.
 * @param file - The uploaded File object
 * @param folder - Subdirectory (e.g. "blog", "gallery", "avatars")
 * @returns Public URL and pathname of the stored file
 */
export async function putLocal(file: File, folder: string): Promise<UploadResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = join(UPLOAD_DIR, folder);

  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filepath = join(dir, filename);
  await writeFile(filepath, buffer);

  const pathname = `${folder}/${filename}`;
  return {
    url: `${UPLOAD_URL_PREFIX}/${pathname}`,
    pathname,
  };
}

/**
 * Delete a locally stored file given its public URL.
 * @param url - The public URL (e.g. "/uploads/gallery/abc.jpg")
 */
export async function delLocal(url: string): Promise<void> {
  const relative = url.replace(`${UPLOAD_URL_PREFIX}/`, "");
  const filepath = join(UPLOAD_DIR, relative);
  try {
    await unlink(filepath);
  } catch {
    // File may already be deleted — ignore
  }
}
