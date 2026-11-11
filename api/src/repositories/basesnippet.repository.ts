import {Basesnippet, BasesnippetRelations, Filecontainer} from '../models';
import {MongoDataSource} from '../datasources';
import {Constructor, inject} from '@loopback/core';
import {AutoAddRepository} from './autoadd.repository.base';
import {SnippetRepositoryMixin} from '../mixins/basesnippet.repository-mixin';
import {DefaultCrudRepository} from '@loopback/repository';
import {JSDOM} from 'jsdom';
import {
  AnyBulkWriteOperation,
  BulkWriteResult,
  FindCursor,
  ObjectId,
} from 'mongodb';

type FileStyle = Filecontainer['style'];
type MigratedFile = Filecontainer & {legacyStyle?: FileStyle};
type SnippetDoc = {
  _id: ObjectId;
  textcontent?: string;
  files?: Filecontainer[];
};

// A number followed by % or px, as the editor writes it, or a bare number
// (rule 2).
const IMAGE_WIDTH = /^\d+(\.\d+)?(%|px)?$/;
// Inline images only get px widths or bare numbers (rule 5).
const INLINE_IMAGE_WIDTH = /^\d+(\.\d+)?(px)?$/;
const BARE_NUMBER = /^\d+(\.\d+)?$/;
// Widths the SDK (82.25%) and the web app (85%) stored when there was no size.
const DEFAULT_WIDTHS = ['82.25%', '85%'];
const BATCH_SIZE = 1000;

export class BasesnippetRepository extends SnippetRepositoryMixin<
  Basesnippet,
  typeof Basesnippet.prototype.id,
  BasesnippetRelations,
  Constructor<
    DefaultCrudRepository<
      Basesnippet,
      typeof Basesnippet.prototype.id,
      BasesnippetRelations
    >
  >
>(AutoAddRepository) {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Basesnippet, dataSource);
  }

  /**
   * Moves image sizes from `files[].style` into the snippet HTML
   * (`textcontent`), in the form the editor (CKEditor) writes them.
   *
   * Selects every snippet with a `files[].style`, of any `snippetType`.
   * For each file with a `style`, the rules below apply to every `<img>`
   * whose `title` is the file's `fileHash`. "Stored width" is
   * `files[].style.width`.
   *
   * Image inside `<figure class="image">` (block image):
   * 1. The figure already has a width: it stays, and no width is added.
   * 2. Otherwise, stored width is `px`, `%` or a bare number: the figure
   *    gets `style="width:…"` and `class="image_resized"`. A bare number
   *    gets `px`, because the web app showed it as a `width` attribute on
   *    the `<img>`, where a bare number means pixels.
   * 3. Otherwise, stored width is empty, `82.25%` (SDK default) or `85%`
   *    (web app default): no width is added. The image shows at its own
   *    size.
   * 4. With any of rules 1–3: if the `<img>` has a `width` attribute in
   *    `%`, remove `width`, `height` and the `aspect-ratio` style. The web
   *    app wrote them, so they are not the natural size of the image.
   *
   * Image outside a figure (inline image):
   * 5. Stored width is `px` or a bare number, and the `<img>` has no
   *    `style` width: the `<img>` gets `style="width:…"` and
   *    `class="image_resized"`. A bare number gets `px`, as in rule 2.
   *
   * Any other image matches no rule, e.g. a block image without a figure
   * width and with the stored width `auto`, or an inline image with the
   * stored width `50%` or empty.
   *
   * A file is migrated only if all of its images match a rule. Its `style`
   * then moves to `legacyStyle`. Otherwise the file and its images stay as
   * they are, and the file keeps `style`. A file without an `<img>`, e.g.
   * an attachment, matches nothing and keeps `style`. So a second run
   * changes nothing.
   */
  async migrateImageSizes(): Promise<void> {
    const query = {'files.style': {$exists: true}};
    const count = (await this.execute(
      'Basesnippet',
      'countDocuments',
      query,
    )) as unknown as number;
    console.log(`Found ${count} snippets with image sizes in files[].style`);
    if (count === 0) return;

    const parser = new new JSDOM('').window.DOMParser();
    const cursor = (await this.execute('Basesnippet', 'find', query, {
      projection: {textcontent: 1, files: 1},
    })) as unknown as FindCursor<SnippetDoc>;
    let bulkOps: AnyBulkWriteOperation[] = [];
    let migratedCount = 0;
    const write = async () => {
      if (bulkOps.length === 0) return;
      const result = (await this.execute(
        'Basesnippet',
        'bulkWrite',
        bulkOps,
      )) as unknown as BulkWriteResult;
      migratedCount += result.modifiedCount;
      bulkOps = [];
    };
    try {
      for await (const doc of cursor) {
        const update = moveImageSizesToHtml(doc, parser);
        if (!update) continue;
        bulkOps.push({
          updateOne: {
            // Skip a snippet that was edited since it was read.
            filter: {
              _id: doc._id,
              textcontent: doc.textcontent ?? null,
              files: doc.files,
            },
            update: {$set: update},
          },
        });
        if (bulkOps.length >= BATCH_SIZE) await write();
      }
      await write();
      console.log(
        `Moved image sizes into the HTML of ${migratedCount} snippets.`,
      );
    } finally {
      await cursor.close();
    }
  }
}

/**
 * Applies the rules of `migrateImageSizes` to one snippet. Returns the
 * fields to update, or undefined if no file is migrated. `textcontent` is
 * only returned if the HTML changed.
 */
function moveImageSizesToHtml(
  doc: SnippetDoc,
  parser: DOMParser,
): {files: MigratedFile[]; textcontent?: string} | undefined {
  // `<remove>` starts the body, as in the web app's `parseInertHtml`.
  const body = parser.parseFromString(
    '<body><remove></remove>' + (doc.textcontent ?? ''),
    'text/html',
  ).body;
  body.firstElementChild?.remove();
  // Not `querySelectorAll` or `closest`: with one parser for all snippets,
  // jsdom's selector engine keeps every parsed document in memory.
  const images = Array.from(body.getElementsByTagName('img'));

  let filesChanged = false;
  let htmlChanged = false;
  const files = (doc.files ?? []).map((file): MigratedFile => {
    const style = file?.style;
    if (!style) return file;
    const migrations = images
      .filter(img => img.getAttribute('title') === file.fileHash)
      .map(img => planImageMigration(img, style));
    // Keep the file if it has no image, or if any image matches no rule.
    if (migrations.length === 0 || migrations.includes(undefined)) return file;
    // All images match: only now change the HTML.
    for (const migrate of migrations) htmlChanged = migrate!() || htmlChanged;
    filesChanged = true;
    const {style: legacyStyle, ...rest} = file;
    return {...rest, legacyStyle};
  });

  if (!filesChanged) return undefined;
  return htmlChanged ? {files, textcontent: body.innerHTML} : {files};
}

/**
 * Finds the rule of `migrateImageSizes` that matches one image. Returns
 * undefined if no rule matches. Otherwise returns a function that applies
 * the rule to the HTML and returns whether the HTML changed.
 */
function planImageMigration(
  img: HTMLImageElement,
  style: NonNullable<FileStyle>,
): (() => boolean) | undefined {
  const width = style.width ?? '';
  const figure = imageFigure(img);
  if (figure) {
    const figureHasWidth = figure.style.width !== ''; // rule 1
    const isWidth = IMAGE_WIDTH.test(width); // rule 2
    const isDefault = width === '' || DEFAULT_WIDTHS.includes(width); // rule 3
    // No rule matches, e.g. no figure width and the stored width `auto`.
    if (!figureHasWidth && !isWidth && !isDefault) return undefined;
    return () => {
      let changed = false;
      // Rule 2.
      if (!figureHasWidth && !isDefault) {
        setWidth(figure, width);
        changed = true;
      }
      // Rule 4.
      if (img.getAttribute('width')?.endsWith('%')) {
        removeSizeAttributes(img);
        changed = true;
      }
      return changed;
    };
  }
  // Rule 5.
  if (INLINE_IMAGE_WIDTH.test(width) && img.style.width === '') {
    return () => {
      setWidth(img, width);
      return true;
    };
  }
  // Any other inline image, e.g. with the stored width `50%` or empty.
  return undefined;
}

// The closest `<figure class="image">` around the image, as the editor
// writes a block image.
function imageFigure(img: HTMLImageElement): HTMLElement | undefined {
  for (let el = img.parentElement; el; el = el.parentElement) {
    if (el.localName === 'figure' && el.classList.contains('image')) return el;
  }
  return undefined;
}

// Sets the width as the editor does: `style="width:…"` and `image_resized`.
// A bare number gets `px` (rules 2 and 5).
function setWidth(element: HTMLElement, width: string) {
  element.style.width = BARE_NUMBER.test(width) ? `${width}px` : width;
  element.classList.add('image_resized');
}

function removeSizeAttributes(img: HTMLImageElement) {
  img.removeAttribute('width');
  img.removeAttribute('height');
  img.style.removeProperty('aspect-ratio');
  // `cssText` holds only valid declarations. This also drops an
  // `aspect-ratio` like `85%/220`, which is not valid CSS.
  if (img.style.length > 0) {
    img.setAttribute('style', img.style.cssText);
  } else {
    img.removeAttribute('style');
  }
}
