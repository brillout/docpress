export { sponsorsList }

import type { Sponsor } from '../Sponsors'
import ccoliLogo from './companyLogos/ccoli.svg'
import contraLogo from './companyLogos/contra.svg'
import mfqsLogo from './companyLogos/mfqs.svg'
import reporaLogo from './companyLogos/repora.svg'
import burdaforwardLogo from './companyLogos/burdaforward.png'
import inlangLogo from './companyLogos/inlang.png'

const sponsorsList: Sponsor[] = [
  {
    companyName: 'BurdaFoward',
    companyLogo: burdaforwardLogo,
    plan: 'platinum',
    website: 'https://www.burda-forward.de'
  },
  {
    companyName: 'Contra',
    companyLogo: contraLogo,
    plan: 'gold',
    website: 'https://contra.com'
  },
  {
    companyName: 'ccoli',
    companyLogo: ccoliLogo,
    plan: 'silver',
    website: 'https://ccoli.co'
  },
  {
    companyName: 'My Favorite Quilt Store',
    companyLogo: mfqsLogo,
    plan: 'bronze',
    website: 'https://myfavoritequiltstore.com'
  },
  {
    companyName: 'Repora',
    companyLogo: reporaLogo,
    plan: 'bronze',
    website: 'https://www.repora.com'
  },
  {
    companyName: 'Inlang',
    companyLogo: inlangLogo,
    plan: 'indie',
    website: 'https://inlang.com/'
  },
  {
    username: 'ser1us'
  },
  {
    username: 'samuelstroschein'
  },
  {
    username: 'szarapka'
  },
  {
    username: 'techniath'
  },
  {
    username: 'DannyZB'
  },
  {
    username: 'pieperz'
  },
  {
    username: 'hemengke1997'
  },
  {
    username: 'spacedawwwg'
  },
  {
    username: 'arthurgailes'
  },
  {
    username: 'stackblitz'
  },
  {
    username: 'codthing'
  },
  {
    username: 'Junaidhkn'
  },
  {
    username: 'zgfdev'
  }
]
