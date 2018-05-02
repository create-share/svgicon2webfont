# svgicon2webfont

Convert svg icons to webfont.

## Install

```
npm install svgicon2webfont --save
```

## Usage

```js
const svgicon2webfont = require('svgicon2webfont');

svgicon2webfont({
  fontName: 'iconfont',
  glyphs: [{
    name: 'xx',
    codepoint: 0xF101,
    svg: fs.readFileSync('xx.svg')).toString()
  }],
  dest: 'dest'
}).then((result) => {
  // handle result
}).catch((error) => {
  // handle error
})
```

## Options

### fontName

*required*

Type: `string`

Name of font and base name of font files.

### dest

*required*

Type: `string`

Directory for generated font files.

### glyphs

*required*

Type: `Array<Glyph>`

Specific `name`, `codepoint`, `svg` for icons.

```ts
interface Glyph {
  name: string;
  codepoint: number;
  svg: string;
}
```

### fontName, normalize, fontHeight, round, descent

Options that are passed directly to [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont).

### formatOptions

Type: `object`

Specific per format arbitrary options to pass to the generator

format and matching generator:
- `svg` - [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont).
- `ttf` - [svg2ttf](https://github.com/fontello/svg2ttf).
- `woff2` - [ttf2woff2](https://github.com/nfroidure/ttf2woff2).
- `woff` - [ttf2woff](https://github.com/fontello/ttf2woff).
- `eot` - [ttf2eot](https://github.com/fontello/ttf2eot).

```js
svgicon2webfont({
  // options
  formatOptions: {
  	// options to pass specifically to the ttf generator
  	ttf: {
  		ts: 1451512800000
  	}
  }
})
```
