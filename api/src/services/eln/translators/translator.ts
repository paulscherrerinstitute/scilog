/**
 * The per-publisher translation seam for ELN import.
 *
 * An imported archive is a container (see `../archive`) whose crate follows one
 * publisher's RO-Crate profile (SciLog, openBIS, ...). Each publisher has a
 * `Translator` that recognises its crates and translates them into the shared
 * `LogbookDraft`. The registry picks the translator whose `matches` accepts a
 * given crate; the import service then persists the draft.
 *
 * This module is the contract only — it never imports a concrete translator.
 * The composed registry lives in the barrel (`./index`).
 */

import type {ROCrate} from 'ro-crate';
import type {Logbook, Paragraph} from '../../../models';
import type {Filesnippet} from '../../../models/file.model';
import {ElnErrorCode, ElnImportError} from '../errors';

// --- canonical model (what every publisher's crate is translated into) ---

export type LogbookDraft = {
  fields: Partial<Logbook>;
  paragraphs: ParagraphDraft[];
};

export type ParagraphDraft = {
  fields: Partial<Paragraph>;
  files: FileDraft[];
  /** Paragraphs nested under this one; comments are the common case. */
  paragraphs: ParagraphDraft[];
};

export type FileDraft = {
  /** Archive-relative `@id`; locates the file's bytes for upload. */
  elnId: string;
  fields: Partial<Filesnippet>;
};

// --- the seam ---

export interface Translator {
  /** Cheap, side-effect-free check of whether this crate is our publisher's. */
  matches(crate: ROCrate): boolean;
  /** Translate the crate into the canonical draft. */
  toSciLog(crate: ROCrate): LogbookDraft;
}

/** Holds the supported translators and selects the one for a given crate. */
export class TranslatorRegistry {
  constructor(private readonly translators: Translator[]) {}

  select(crate: ROCrate): Translator {
    const translator = this.translators.find(t => t.matches(crate));
    if (!translator) {
      throw new ElnImportError([
        {
          code: ElnErrorCode.INVALID_PUBLISHER,
          message: 'unsupported ELN source: no matching translator',
        },
      ]);
    }
    return translator;
  }
}
