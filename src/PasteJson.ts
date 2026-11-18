import {Fragment, Schema, Slice} from 'prosemirror-model';
import {
  EditorState,
  Plugin,
  PluginKey,
  TextSelection,
  Transaction,
} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {canNodeTypeReplaceBlockAt} from './canNodeTypeReplaceBlock';

// Refuse to attempt JSON parsing / schema conversion on oversized pasted
// text — pathological payloads can otherwise burn seconds (or crash) in
// JSON.parse + nodeFromJSON on every paste event.
const MAX_JSON_PASTE_LENGTH = 5_000_000;

export class PasteJSONPlugin extends Plugin {
  schema!: Schema;
  slice?: Slice;
  constructor() {
    super({
      key: new PluginKey('pasteJSON'),
      props: {
        transformPastedText(text: string): string {
          if (text.length > MAX_JSON_PASTE_LENGTH) {
            return text;
          }
          try {
            const json = JSON.parse(text);

            if (json) {
              (this as PasteJSONPlugin).slice = (
                this as PasteJSONPlugin
              ).getSlice(json);
            }
          } catch {
            /* ignore */
          }
          return text;
        },
        transformPasted(slice: Slice) {
          const lastSlice = (this as PasteJSONPlugin).slice;
          if (0 < slice.content.childCount && lastSlice) {
            slice = lastSlice;
          }
          // reset
          (this as PasteJSONPlugin).slice = undefined;
          return slice;
        },
      },
      appendTransaction(
        _transactions: readonly Transaction[],
        _oldState: EditorState,
        newState: EditorState
      ) {
        (this as PasteJSONPlugin).schema = newState.schema;
        return undefined;
      },
    });
  }

  getSlice(json: {[key: string]: unknown}): Slice {
    return new Slice(Fragment.from(this.schema.nodeFromJSON(json)), 0, 0);
  }

  // Plugin method that supplies plugin schema to editor
  getEffectiveSchema(schema: Schema): Schema {
    return schema;
  }

  insert(json: {[key: string]: unknown}, view: EditorView): void {
    const {from} = view.state.selection;
    const jsonEx = {...json};
    if ('fragment' === json.type) {
      jsonEx.type = 'reference';
    }
    const jsonNode = this.schema.nodeFromJSON(jsonEx);
    // The node may be a block the block containing the selection's parent
    // cannot hold (e.g. inside enhanced_table_figure_notes); inserting it
    // would let replacement fitting move it outside that boundary and
    // split the surrounding structure.
    if (!canNodeTypeReplaceBlockAt(view.state.doc, from, jsonNode.type)) {
      return;
    }
    let tr = view.state.tr.insert(from, jsonNode);
    // `from + 5` assumed the inserted node's internal structure; clamp to
    // the doc and resolve the nearest valid text position instead.
    const head = Math.min(from + 5, tr.doc.content.size);
    const selection = TextSelection.near(tr.doc.resolve(head));

    tr = tr.setSelection(selection);
    tr = this.insertParagraph(view.state, tr);
    view.dispatch(tr.scrollIntoView());
  }

  // Add empty line after reference
  // To make easier to enter a line after reference
  insertParagraph(state: EditorState, tr: Transaction) {
    const paragraph = state.schema.nodes['paragraph'];
    const textNode = state.schema.text(' ');
    const {from, to} = tr.selection;
    if (from !== to) {
      return tr;
    }
    const paragraphNode = paragraph.create({}, textNode);
    // `node(1)` is undefined for selections that are not inside a parent
    // block (e.g. depth 0 after inserting a top-level node).
    const parentNode = tr.selection.$head.node(1);
    if (!parentNode) {
      return tr;
    }
    const insertPos = Math.max(
      0,
      Math.min(from + parentNode.nodeSize - 4, tr.doc.content.size)
    );
    tr = tr.insert(insertPos, Fragment.from(paragraphNode));
    return tr;
  }
}
