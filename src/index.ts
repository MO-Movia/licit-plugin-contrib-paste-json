import {Schema, Slice} from 'prosemirror-model';
import {EditorState, Plugin, PluginKey, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';

export class PasteJSONPlugin extends Plugin {
  schema: Schema = null;
  constructor() {
    super({
      key: new PluginKey('pasteJSON'),
      props: {
        transformPasted(slice: Slice) {
          if (0 < slice.content.childCount) {
            try {
              const json = JSON.parse(slice.content.firstChild.textContent);

              if (json) {
                slice = Slice.fromJSON((this as PasteJSONPlugin).schema, json);
              }
            } catch (_e) {
              /* empty */
            }
          }
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

  // Plugin method that supplies plugin schema to editor
  getEffectiveSchema(schema: Schema): Schema {
    return schema;
  }

  insert(json: {[key: string]: unknown}, view: EditorView): void {
    const slice = Slice.fromJSON(this.schema, json);
    const tr = view.state.tr.replaceSelection(slice);
    view.dispatch(tr.scrollIntoView());
  }
}
