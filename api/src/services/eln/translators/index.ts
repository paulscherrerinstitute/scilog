/**
 * Public entry point for the translator module: the contract types consumers
 * need, plus the composed registry of the publishers SciLog supports.
 *
 * This barrel is the module's composition root — the one place that imports
 * concrete translators. The translators themselves and the `TranslatorRegistry`
 * class stay module-internal (import from `./translator` / `./scilog` directly
 * if a test ever needs them).
 */

import {ScilogTranslator} from './scilog';
import {TranslatorRegistry} from './translator';

export type {
  Translator,
  LogbookDraft,
  ParagraphDraft,
  FileDraft,
} from './translator';

/** The publishers SciLog can import, most specific first. */
export const translatorRegistry = new TranslatorRegistry([
  new ScilogTranslator(),
]);
