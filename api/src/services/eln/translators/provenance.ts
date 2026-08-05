/**
 * The `eln:*` provenance tag vocabulary, shared by every translator so the
 * format stays uniform across publishers. Translators extract the values from
 * their own crate shape and feed them here; only the formatting lives here.
 */

/** Provenance tag naming the publisher an import came from. */
export function sourceTag(source: string): string {
  return `eln:source:${source}`;
}

/**
 * Per-entity provenance tags from already-extracted values. `author` is
 * whatever identifies the author in the source (an email for SciLog, a name
 * for openBIS) — publishers don't all carry an email. `created` is a `Date`
 * (a valid one); it is tagged as its UTC calendar date.
 */
export function provenanceTags(values: {
  id: string;
  author?: string;
  created?: Date;
}): string[] {
  const tags = [`eln:id:${values.id}`];
  if (values.author) tags.push(`eln:author:${values.author}`);
  // A malformed source date is dropped, not fatal — the tag is best-effort.
  if (values.created && isValidDate(values.created)) {
    tags.push(`eln:created:${values.created.toISOString().split('T')[0]}`);
  }
  return tags;
}

/** JS has no native Date validity check; an invalid Date has a NaN timestamp. */
function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}
