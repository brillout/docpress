import React from 'react'
import iconHeart from '../icons/heart.svg'
import { usePageContext } from '../renderer/usePageContext'
import { assert } from '../utils'
import ccoliLogo from './Sponsors/companyLogos/ccoli.svg'
import contraLogo from './Sponsors/companyLogos/contra.svg'
import mfqsLogo from './Sponsors/companyLogos/mfqs.svg'
import medalGold from './Sponsors/medalGold.svg'
import medalSilver from './Sponsors/medalSilver.svg'
import medalBronze from './Sponsors/medalBronze.svg'
import labelBg from './Sponsors/label.svg'

export { Sponsors }

type Plan = 'bronze' | 'backer' | 'silver' | 'gold'

type Sponsor =
  | {
      companyName: string
      companyLogo: string
      website: string
      plan: Plan
    }
  | {
      username: string
    }

const sponsors: Sponsor[] = [
  {
    companyName: 'My Favorite Quilt Store',
    companyLogo: mfqsLogo,
    plan: 'silver',
    website: 'https://myfavoritequiltstore.com'
  },
  {
    companyName: 'ccoli',
    companyLogo: ccoliLogo,
    plan: 'gold',
    website: 'https://ccoli.co'
  },
  {
    companyName: 'Contra',
    companyLogo: contraLogo,
    plan: 'bronze',
    website: 'https://contra.com'
  },
  {
    username: 'spacedawwwg'
  },
  {
    username: 'codthing'
  },
  {
    username: 'Junaidhkn'
  }
]

function Sponsors() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <div style={{ textAlign: 'center', marginTop: 19 }}>
      <a
        className="button"
        href="https://github.com/sponsors/brillout"
        style={{
          color: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '5px 10px',
          marginBottom: 10
        }}
      >
        <img src={iconHeart} height={22} /> <span style={{ marginLeft: 7, fontSize: '1.07em' }}>Sponsor</span>
      </a>
      <div></div>
      <div style={{ maxWidth: 400, display: 'inline-block', marginTop: 12, marginBottom: 2 }}>
        {projectInfo.projectNameJsx || projectInfo.projectName} is free and open source, made possible by wonderful
        sponsors.
      </div>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'end' }}
      >
        {sponsors.map((sponsor, i) => (
          <SponsorDiv sponsor={sponsor} key={i} />
        ))}
      </div>
    </div>
  )
}

function SponsorDiv({ sponsor }: { sponsor: Sponsor }) {
  let imgSrc: string
  let imgAlt: string | undefined
  let width: number
  let height: number
  let website: string
  let padding: number
  let backgroundColor = '#f0f0f0'
  let label: null | JSX.Element = null
  if ('username' in sponsor) {
    website = `https://github.com/${sponsor.username}`
    imgSrc = `https://github.com/${sponsor.username}.png?size=30`
    width = 30
    height = 30
    padding = 0
    backgroundColor = 'none'
  } else {
    imgSrc = sponsor.companyLogo
    website = sponsor.website
    const size = getImageSize(sponsor.plan)
    width = size.width
    height = size.height
    padding = size.padding
    imgAlt = sponsor.companyName
    label = <Label sponsor={sponsor} />
  }
  const marginWidth = 5
  return (
    <a
      href={website}
      style={{
        margin: `10px ${marginWidth}px`
      }}
    >
      {label}
      <div
        style={{
          backgroundColor,
          borderRadius: 7,
          overflow: 'hidden',
          width,
          maxWidth: `calc(100vw - 2 * var(--main-view-padding) - 2 * ${marginWidth}px)`,
          height,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <img
          style={{ maxWidth: `calc(100% - ${padding}px)`, maxHeight: height - padding, zIndex: 2 }}
          src={imgSrc}
          alt={imgAlt}
        />
      </div>
    </a>
  )
}

function Label({ sponsor }: { sponsor: Sponsor }) {
  let medalSrc: string
  let letterSpacing: number | undefined
  assert(!('username' in sponsor))
  if (sponsor.plan === 'gold') {
    medalSrc = medalGold
    letterSpacing = 1
  } else if (sponsor.plan === 'silver') {
    medalSrc = medalSilver
    letterSpacing = 1
  } else if (sponsor.plan === 'bronze') {
    medalSrc = medalBronze
  } else {
    assert(false)
  }

  return (
    <div
      style={{
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingBottom: 1
      }}
    >
      <img src={labelBg} style={{ height: 24, position: 'absolute', bottom: 0 }} />
      <img src={medalSrc} style={{ height: 15, zIndex: 1, marginRight: 5 }} />{' '}
      <span
        style={{
          zIndex: 1,
          fontSize: '0.82em',
          position: 'relative',
          top: 0,
          fontWeight: 500,
          color: '#666',
          letterSpacing
        }}
      >
        {capitalizeFirstLetter(sponsor.plan)}
      </span>
    </div>
  )
}

function getImageSize(plan: Plan) {
  if (plan === 'gold') {
    return { width: 320, height: 120, padding: 30 }
  }
  if (plan === 'silver') {
    return { width: 220, height: 80, padding: 20 }
  }
  if (plan === 'bronze') {
    return { width: 170, height: 50, padding: 15 }
  }
  assert(false)
}

function capitalizeFirstLetter(word: string): string {
  return word[0].toUpperCase() + word.slice(1)
}
