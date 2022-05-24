export { parseEmojis }

// @ts-ignore
import twemoji from 'twemoji'

const emojiList = {
  // https://emojipedia.org/no-entry/
  ':no_entry:': 0x26D4,
  // https://emojipedia.org/warning/
  ':warning:': 0x26A0,
  /*
  // https://emojipedia.org/red-heart/
  ':heart:': 0x2764,
  */
}

function parseEmojis(html: string) {
  Object.entries(emojiList).forEach(([shortcode, codepoint]) => {
    if( !html.includes(shortcode)) {
      return
    }
    const emojiStr = twemoji.convert.fromCodePoint(codepoint)
    let emojiImg = twemoji.parse(emojiStr, {
      folder: 'svg',
      ext: '.svg'
    })
    const style = "height: 1.275em; width: 1.275em; vertical-align: -20%"
    emojiImg = emojiImg.replace('<img class="emoji" ', `<img style="${style}" `)
    html = html.split(shortcode).join(emojiImg)
  })
  return html
}
