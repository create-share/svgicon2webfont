const fs = require('fs')
const Readable = require('stream').Readable
const { pick, extend } = require('lodash')
const join = require('path').join
const promisify = require('util').promisify
const SVGIcons2SVGFont = require('svgicons2svgfont')
const svg2ttf = require('svg2ttf')
const ttf2woff = require('ttf2woff')
const ttf2woff2 = require('ttf2woff2')
const ttf2eot = require('ttf2eot')

const writeFile = promisify(fs.writeFile)

const DEFAULT_OPTIONS = {
  // A fontHeight of at least than 1000 is recommended, otherwise further steps
  // (rounding in svg2ttf) could lead to ugly results. Use the fontHeight option
  // to scale icons.
  fontHeight: 1000,
  normalize: true,
  formatOptions: {}
}

const Generator = {
  svg: async function svg (options) {
    return new Promise((resolve, reject) => {
      let font = Buffer.alloc(0)
      let svgOptions = pick(options, 'fontName', 'fontHeight', 'descent', 'normalize', 'round')

      if (options.formatOptions.svg) {
        svgOptions = extend(svgOptions, options.formatOptions.svg)
      }

      const fontStream = new SVGIcons2SVGFont(svgOptions)
      fontStream.on('data', (data) => {
        font = Buffer.concat([font, data])
      })
      fontStream.on('end', () => {
        resolve(font.toString())
      })

      options.glyphs.forEach((glyph, index) => {
        const name = glyph.name
        const unicode = String.fromCharCode(glyph.codepoint)
        let ligature = ''
        for (let i = 0; i < name.length; i++) {
          ligature += String.fromCharCode(name.charCodeAt(i))
        }
        const stream = new Readable()
        stream.push(glyph.svg)
        stream.push(null)
        stream.metadata = {
          name: name,
          unicode: [unicode, ligature]
        }
        fontStream.write(stream)
      })

      fontStream.end()
    })
  },
  ttf: async function (options, svgFont) {
    return new Promise((resolve, reject) => {
      const font = svg2ttf(svgFont, options.formatOptions.ttf)
      resolve(Buffer.from(font.buffer))
    })
  },
  woff: async function (options, ttfFont) {
    return new Promise((resolve, reject) => {
      const font = ttf2woff(new Uint8Array(ttfFont), options.formatOptions.woff)
      resolve(Buffer.from(font.buffer))
    })
  },
  woff2: async function (options, ttfFont) {
    return new Promise((resolve, reject) => {
      const font = ttf2woff2(new Uint8Array(ttfFont), options.formatOptions.woff2)
      resolve(Buffer.from(font.buffer))
    })
  },
  eot: async function (options, ttfFont) {
    return new Promise((resolve, reject) => {
      const font = ttf2eot(new Uint8Array(ttfFont), options.formatOptions.eot)
      resolve(Buffer.from(font.buffer))
    })
  }
}

async function svgicon2webfont (options) {
  options = extend({}, DEFAULT_OPTIONS, options)
  const svg = await Generator.svg(options)
  const ttf = await Generator.ttf(options, svg)
  const [woff, woff2, eot] = await Promise.all(
    ['woff', 'woff2', 'eot'].map((i) => Generator[i](options, ttf))
  )
  const result = { svg, ttf, woff, woff2, eot }

  if (options.dest) {
    const types = Object.keys(result)
    const filename = options.filename || options.fontName
    const joinExt = (ext) => join(options.dest, filename + '.' + ext)
    await Promise.all(types.map((type) => writeFile(joinExt(type), result[type])))
  }

  return result
}

module.exports = svgicon2webfont
