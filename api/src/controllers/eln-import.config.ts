/**
 * Tunable limits for the ELN import endpoint.
 *
 * A fixed default for now, but structured as the single source of truth so
 * it can later be sourced from an environment variable without touching the
 * controller (which enforces the limit) or the OpenAPI spec (which documents
 * it) — both import from here. Note that any limit raised above the reverse
 * proxy's body-size cap is only enforced as far as the proxy allows.
 */
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
