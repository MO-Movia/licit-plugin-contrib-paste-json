import {Fragment, Schema, Slice} from 'prosemirror-model';
import {EditorState, Plugin, PluginKey, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

export class PasteJSONPlugin extends Plugin {
  schema: Schema = null;
  slice: Slice = null;
  constructor() {
    super({
      key: new PluginKey('pasteJSON'),
      props: {
        transformPastedText(text: string): string {
          try {
            const json = JSON.parse(text);

            if (json) {
              (this as PasteJSONPlugin).slice = (
                this as PasteJSONPlugin
              ).getSlice(json);
            }
          } catch (_e) {
            /* empty */
          }
          return text;
        },
        transformPasted(slice: Slice) {
          if (0 < slice.content.childCount && (this as PasteJSONPlugin).slice) {
            slice = (this as PasteJSONPlugin).slice;
          }
          // reset
          (this as PasteJSONPlugin).slice = null;
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
    const tr = view.state.tr.replaceSelection(this.getSlice(json));
    view.dispatch(tr.scrollIntoView());
  }
}
