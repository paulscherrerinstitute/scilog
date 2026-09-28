/**
 * RO-Crate `@id`s are URI references, so an id may be percent-encoded
 * (openBIS's "…/a%20b.txt"). Decode it to the literal archive path, leaving a
 * malformed value unchanged — a no-op for unencoded ids.
 */
export function decodeCrateId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}
