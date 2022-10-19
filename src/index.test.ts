import {createEditor, doc, p} from 'jest-prosemirror';
import {PasteJSONPlugin} from './index';

describe('PasteJSONFPlugin', () => {
  it('should handle insert json', () => {
    const plugin = new PasteJSONPlugin();
    createEditor(doc('<cursor>', p('Hello World')), {
      plugins: [plugin],
    });
  });
});
