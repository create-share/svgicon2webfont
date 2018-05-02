const fs = require('fs')
const join = require('path').join
const { template } = require('lodash')
const svgicon2webfont = require('../index')

let startCodepoint = 0xF101

const glyphs = [
  {
    name: 'flag',
    codepoint: startCodepoint++,
    svg: fs.readFileSync(join(__dirname, 'icons/flag.svg')).toString()
  },
  {
    name: 'alarm',
    codepoint: startCodepoint++,
    svg: fs.readFileSync(join(__dirname, 'icons/alarm.svg')).toString()
  }
]

svgicon2webfont({
  fontName: 'iconfont',
  glyphs: glyphs,
  dest: join(__dirname, 'dest')
}).then((result) => {
  const path = join(__dirname, 'template.html')
  const compiled = template(fs.readFileSync(path))
  const content = compiled({
    fontName: 'iconfont',
    className: 'iconfont',
    glyphs: glyphs.map(i => {
      return Object.assign({ unicode: '\\' + i.codepoint.toString(16) }, i)
    })
  })
  fs.writeFileSync(join(__dirname, 'dest/index.html'), content)
}).catch((err) => {
  console.log(err)
})
