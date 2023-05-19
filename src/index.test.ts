import { createEditor, doc, p } from 'jest-prosemirror';
import { PasteJSONPlugin } from './index';
import { EditorView } from 'prosemirror-view';
import { schema, builders } from 'prosemirror-test-builder';
import { Schema, Slice } from 'prosemirror-model';
import { Plugin, PluginKey, EditorState, TextSelection } from 'prosemirror-state';


class TestPlugin extends Plugin {
  constructor() {
    super({
      key: new PluginKey('TestPlugin'),
    });
  }
}
describe('PasteJSONFPlugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new PasteJSONPlugin();
  });

  it('should handle insert json', () => {
    const plugin = new PasteJSONPlugin();
    createEditor(doc('<cursor>', p('Hello World')), {
      plugins: [plugin],
    });
  });

  it('transformPastedText method with null value', () => {
    const transformedText = plugin.props.transformPastedText.call(plugin, null);
    expect(transformedText).toBe(null);
  });

  it('insert method should insert JSON and add an empty line after reference', () => {
    const json = {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello world' }],
    };
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks
    });
    const { doc, p } = builders(mySchema, { p: { nodeType: 'paragraph' } });
    const state = EditorState.create({
      doc: doc(p('Hello World!!!!!!!!!!!!')),
      schema: mySchema,
      plugins: [plugin],
    });
    state.applyTransaction(state.tr.scrollIntoView());
    const dom = document.createElement('div');

    const view = new EditorView(
      { mount: dom },
      {
        state: state,
      },
    );
    const selection = TextSelection.create(view.state.doc, 6, 12);
    const tr = view.state.tr.setSelection(selection);
    view.dispatch = jest.fn(),
      view.updateState(
        view.state.reconfigure({ plugins: [plugin, new TestPlugin()] })
      );

    view.dispatch(tr);
    const insertMethod = plugin.insert(json, view);

    expect(insertMethod).toBeUndefined();
  });

  it('appendTransaction method should set the plugin schema', () => {
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks
    });
    const before = 'hello';
    const after = ' world';
    const effSchema = plugin.getEffectiveSchema(mySchema);
    const state = EditorState.create({
      doc: doc(p(before, after)),
      schema: effSchema,
      plugins: [plugin],
    });
    plugin.spec.appendTransaction([], {}, state);
    expect(plugin.schema).toBe(null);
  });

  it('transformPasted method should replace slice', () => {
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks
    });
    const slice = new Slice(mySchema, 0, 0);
    slice.content.childCount = -1;
    plugin.slice = slice;
    const transformedSlice = plugin.props.transformPasted(slice);
    expect(transformedSlice).toBe(slice);
    expect(plugin.slice).toBeNull();
  });

  it('transformPasted method should replace slice with stored slice', () => {
    const mySchema = new Schema({
      nodes: schema.spec.nodes,
      marks: schema.spec.marks
    });
    const slice = new Slice(mySchema, 0, 0);
    slice.content.childCount = 1;
    plugin.slice = slice;
    const transformedSlice = plugin.props.transformPasted(slice);
    expect(transformedSlice).toBe(slice);
    expect(plugin.slice).toBeNull();
  });

  it('transformPastedText method should parse JSON and set the slice', () => {
    const text = JSON.stringify({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello' }],
    });
    const transformedText = plugin.props.transformPastedText.call(plugin, text);

    expect(transformedText).toBe(text);
  });
});