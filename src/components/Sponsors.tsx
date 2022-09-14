import React from 'react'
import iconHeart from '../icons/heart.svg'
import { usePageContext } from '../renderer/usePageContext'
import { assert } from '../utils'
import ccoliLogo from './Sponsors/companyLogos/ccoli.svg'
import contraLogo from './Sponsors/companyLogos/contra.svg'
import mfqsLogo from './Sponsors/companyLogos/mfqs.svg'

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

const marginOuter = 20

function Sponsors() {
  const pageContext = usePageContext()
  const { projectInfo } = pageContext.config
  return (
    <div style={{ textAlign: 'center', marginTop: 7 }}>
      <a
        className="button"
        href="https://github.com/sponsors/brillout"
        style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', padding: '5px 10px', marginBottom: 10 }}
      >
        <img src={iconHeart} height={22} /> <span style={{ marginLeft: 7, fontSize: '1.07em' }}>Sponsor</span>
      </a>
      <div></div>
      <div style={{ maxWidth: 400, display: 'inline-block', marginTop: 10, marginBottom: 8 }}>
        {projectInfo.projectNameJsx || projectInfo.projectName} is free and open source, made possible by our wonderful
        sponsors.
      </div>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', margin: marginOuter, justifyContent: 'center', alignItems: 'end' }}
      >
        {sponsors.map((sponsor) => (
          <SponsorDiv sponsor={sponsor} />
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
  }
  const margin = 5
  return (
    <a
      href={website}
      style={{
        backgroundColor,
        borderRadius: 7,
        overflow: 'hidden',
        margin,
        width,
        maxWidth: `calc(100vw - 2 * ${marginOuter}px - 2 * ${margin}px)`,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img style={{ maxWidth: `calc(100% - ${padding}px)`, maxHeight: height - padding }} src={imgSrc} alt={imgAlt} />
    </a>
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
