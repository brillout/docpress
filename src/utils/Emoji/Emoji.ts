import React from 'react'
import { assert } from '../assert'

import { iconMechanicalArm, iconCompass, iconRoadFork, iconShield, iconTypescript, iconEngine } from './assets'

export { Emoji }
export type { EmojiName }

type EmojiName =
  | 'warning'
  | 'typescript'
  | 'shield'
  | 'mechanical-arm'
  | 'mountain'
  | 'rocket'
  | 'wrench'
  | 'compass'
  | 'seedling'
  | 'books'
  | 'plug'
  | 'earth'
  | 'gear'
  | 'red-heart'
  | 'high-voltage'
  | 'gem-stone'
  | 'dizzy'
  | 'sparkles'
  | 'writing-hang'
  | 'road-fork'
  | 'engine'
  | 'red-circle'
  | 'sparkling-heart'
  | 'gift'
  | 'package'
  | 'info'
  | 'lab'
  | 'trophy'

function Emoji({ name, style }: { name: EmojiName; style?: React.CSSProperties }): JSX.Element {
  const emoji =
    // ***
    // U+26A0
    // https://emojipedia.org/warning/
    // https://www.unicompat.com/26A0 => 94.1%
    // https://www.unicompat.com/26A0-FE0F => 92.4%
    // https://www.unicompat.com/2697 => 94.1%
    (name === 'warning' && Unicode(0x26a0, { fontFamily: 'emoji' })) ||
    // ***
    // U+2697
    // https://emojipedia.org/alembic/
    // https://www.unicompat.com/2697 => 94.1%
    (name === 'lab' && Unicode(0x2697)) ||
    // ***
    // U+2139
    // https://emojipedia.org/information/
    // https://www.unicompat.com/2139 => 94.8%
    // https://www.unicompat.com/2139-FE0F => 92.4%
    (name === 'info' && Unicode(0x2139, { fontFamily: 'emoji' })) ||
    // ***
    // U+1F4E6
    // https://emojipedia.org/package/
    // https://www.unicompat.com/1F4E6 => 94.1%
    (name === 'package' && Unicode(0x1f4e6)) ||
    // ***
    // U+1F381
    // https://emojipedia.org/wrapped-gift/
    // https://www.unicompat.com/1F381 => 94.1%
    (name === 'gift' && Unicode(0x1f381)) ||
    // ***
    // U+1F496
    // https://emojipedia.org/sparkling-heart/
    // https://www.unicompat.com/1F496 => 94.1%
    (name === 'sparkling-heart' && Unicode(0x1f496)) ||
    // ***
    // U+2B55
    // https://emojipedia.org/hollow-red-circle/
    // https://www.unicompat.com/2B55 => 94.1%
    (name === 'red-circle' && Unicode(0x2b55)) ||
    // ***
    (name === 'engine' && Img(iconEngine)) ||
    // ***
    // https://www.typescriptlang.org/branding/
    (name === 'typescript' && Img(iconTypescript)) ||
    // ***
    // U+FE0F
    // https://emojipedia.org/shield/
    // https://www.unicompat.com/FE0F => 46.5%
    // https://icon-sets.iconify.design/noto/shield/
    (name === 'shield' && Img(iconShield)) ||
    // ***
    // Custom
    (name === 'road-fork' && Img(iconRoadFork, '1.4em')) ||
    // ***
    // U+270D
    // https://emojipedia.org/writing-hand/
    // https://www.unicompat.com/270D => 93.8%
    (name === 'writing-hang' && Unicode(0x270d)) ||
    // ***
    // U+1F4AB
    // https://emojipedia.org/dizzy/
    // https://www.unicompat.com/1F4AB => 94.1%
    (name === 'dizzy' && Unicode(0x1f4ab)) ||
    // ***
    // U+1F9BE
    // https://iconify.design/icon-sets/noto/mechanical-arm.html
    // https://emojipedia.org/mechanical-arm/
    // https://www.unicompat.com/1f9be => 65.5%
    (name === 'mechanical-arm' && Img(iconMechanicalArm)) ||
    // ***
    // U+1F680
    // https://www.unicompat.com/1F680 => 94.1
    (name === 'rocket' && Unicode(0x1f680)) ||
    // ***
    // U+1F527
    // https://emojipedia.org/wrench/
    // https://www.unicompat.com/1F527 => 94.1%
    (name === 'wrench' && Unicode(0x1f527)) ||
    // ***
    // U+1F9ED
    // https://iconify.design/icon-sets/noto/compass.html
    // https://www.unicompat.com/1F9ED => 67.1%
    (name === 'compass' && Img(iconCompass, '1.4em')) ||
    // ***
    // U+1F331
    // https://www.unicompat.com/1F331 => 94.1%
    (name === 'seedling' && Unicode(0x1f331)) ||
    // ***
    // U+1F4DA
    // https://www.unicompat.com/1F4DA => 94.1%
    (name === 'books' && Unicode(0x1f4da)) ||
    // ***
    // U+1F50C
    // https://www.unicompat.com/1F50C => 94.1%
    (name === 'plug' && Unicode(0x1f50c)) ||
    // ***
    // U+1F30D
    // https://www.unicompat.com/1F30D => 88.8%
    (name === 'earth' && Unicode(0x1f30d)) ||
    // ***
    // U+2699
    // https://www.unicompat.com/2699 => 94.1%
    (name === 'gear' && Unicode(0x2699)) ||
    // ***
    // U+2764
    // https://emojipedia.org/red-heart/
    // https://www.unicompat.com/2764 => 94.4%
    // https://www.unicompat.com/2764-FE0F => 92.4%
    (name === 'red-heart' && Unicode(0x2764, { fontFamily: 'emoji' })) ||
    // U+26A1
    // https://www.unicompat.com/26A1 => 94.1%
    (name === 'high-voltage' && Unicode(0x26a1)) ||
    // U+2728
    // https://emojipedia.org/sparkles/
    // https://www.unicompat.com/2728 => 94.1%
    (name === 'sparkles' && Unicode(0x2728)) ||
    // ***
    // U+1F48E
    // https://emojipedia.org/gem-stone/
    // https://www.unicompat.com/1F48E => 94.1%
    (name === 'gem-stone' && Unicode(0x1f48e)) ||
    // ***
    // 0x1F3C6
    // https://emojipedia.org/trophy/
    // https://www.unicompat.com/1F3C6 => 94.1%
    (name === 'trophy' && Unicode(0x1f3c6)) ||
    false
  /* ======= Unused ========
    // ***
    // U+1FAA8
    // https://emojipedia.org/rock/
    // https://www.unicompat.com/1faa8 => 20.7%
    //
    // ***
    // U+26F0
    // https://emojipedia.org/mountain/
    // https://iconify.design/icon-sets/noto/mountain.html
    // https://www.unicompat.com/26F0 => 89.3%
    (name === 'mountain' && Img(iconMountain)) ||
    //
    // ***
    // U+2194
    // https://emojipedia.org/left-right-arrow/
    // https://www.unicompat.com/2194 => 95.0%
    // Couldn't manage to show colored version
    (name === 'left-right-arrow' && Unicode(0x2194)) ||
    (name === 'left-right-arrow' && Unicode(0x2194, { fontFamily: 'reset' })) ||
    (name === 'left-right-arrow' && Unicode(0xFE0F)) ||
    (name === 'left-right-arrow' && Unicode(0xFE0F, { fontFamily: 'reset' })) ||
    ======================== */

  assert(emoji, { name })

  return emoji

  function Unicode(codePoint: number, styleAddendum?: React.CSSProperties) {
    const text = String.fromCodePoint(codePoint)
    if (style || styleAddendum) {
      return React.createElement('span', { style: { ...style, ...styleAddendum } }, text)
    } else {
      return React.createElement(React.Fragment, null, text)
    }
  }

  function Img(imgSrc: string, width: string = '1.15em') {
    const props = {
      src: imgSrc,
      style: {
        verticalAlign: 'text-top',
        fontSize: '1em',
        width,
        ...style
      }
    }
    return React.createElement('img', props)
  }
}
