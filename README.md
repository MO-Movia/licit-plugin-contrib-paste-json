



# PasteJSON Plugin!
ProseMirror based plugin that allows you to paste in prosemirror JSON into the editor.

## Getting Started  

### Getting repository

```
git clone https://github.com/MO-Movia/licit-plugin-contrib-paste-json.git
```
### Install dependencies
```
npm install
``` 
### To build the distribution files
```
# At the working directory `modusoperandi-licit-pasteJSON`
npm run build:dist 
```
### To build the pasteJSON pack
```
# At the working directory `modusoperandi-licit-pasteJSON`
npm pack
```  
### To publish pasteJSON
```
# At the working directory `modusoperandi-licit-pasteJSON`
npm run publish:dist
```  
 
## Windows Specific

Use Git bash or Windows Power Shell to install build and run the project

## To use this, need to set data transfer data or clipboard data like this:

    dragDivElement.ondragstart = processDrag;
    dragDivElement.ondragover = cancelDefault;
...

    function cancelDefault(e) {
        e.preventDefault();
    }
    
    function processDrag(e) {
      e.dataTransfer.setData(
    'text/plain',
    '{"type":"paragraph","attrs":{"align":null,"color":null,"id":"","indent":0,"lineSpacing":null,"paddingBottom":"","paddingTop":""},"content":[{"type":"text","text":"He"},{"type":"text","marks":[{"type":"underline"}],"text":"ll"},{"type":"text","text":"o"},{"type":"text","marks":[{"type":"mark-text-color","attrs":{"color":"#f20d96"}}],"text":"3"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"strong"}],"text":"T"},{"type":"text","marks":[{"type":"strong"},{"type":"mark-text-highlight","attrs":{"highlightColor":"#3bf20d"}}],"text":"H"},{"type":"text","marks":[{"type":"strong"}],"text":"IS"}]}');
     e.dataTransfer.setData(
    'text/html',
    '{"type":"paragraph","attrs":{"align":null,"color":null,"id":"","indent":0,"lineSpacing":null,"paddingBottom":"","paddingTop":""},"content":[{"type":"text","text":"He"},{"type":"text","marks":[{"type":"underline"}],"text":"ll"},{"type":"text","text":"o"},{"type":"text","marks":[{"type":"mark-text-color","attrs":{"color":"#f20d96"}}],"text":"3"},{"type":"text","text":" "},{"type":"text","marks":[{"type":"strong"}],"text":"T"},{"type":"text","marks":[{"type":"strong"},{"type":"mark-text-highlight","attrs":{"highlightColor":"#3bf20d"}}],"text":"H"},{"type":"text","marks":[{"type":"strong"}],"text":"IS"}]}');
    }
