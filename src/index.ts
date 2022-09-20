import {Schema, Slice} from 'prosemirror-model';
import {EditorState, Plugin, PluginKey, Transaction} from 'prosemirror-state';

export class PasteJSONPlugin extends Plugin {
  schema: Schema = null;
  constructor() {
    super({
      key: new PluginKey('pasteJSON'),
      props: {
        transformPasted(slice: Slice) {
          if (0 < slice.content.childCount) {
            const json = JSON.parse(slice.content.firstChild.textContent);

            if (json) {
              slice = Slice.fromJSON((this as PasteJSONPlugin).schema, json);
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
        return newState.tr;
      },
    });
  }

  // Plugin method that supplies plugin schema to editor
  getEffectiveSchema(schema: Schema): Schema {
    return schema;
  }
}
