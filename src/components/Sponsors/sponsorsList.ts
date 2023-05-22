export { sponsorsList }

import type { Sponsor } from '../Sponsors'
import contraLogo from './companyLogos/contra.svg'
import mfqsLogo from './companyLogos/mfqs.svg'
import optimizersLogo from './companyLogos/optimizers.svg'
import burdaforwardLogo from './companyLogos/burdaforward.png'
import inlangLogo from './companyLogos/inlang.png'
import alignableLogo from './companyLogos/alignable.svg'

const individuals: Sponsor[] = [
  { username: 'cookieplace' },
  {
    username: 'JiangWeixian'
  },
  {
    username: 'harrytran998'
  },
  {
    username: 'royalswe'
  },
  {
    username: 'alexturpin'
  },
  {
    username: 'gu-stav'
  },
  {
    username: 'YannBirba'
  },
  {
    username: 'fi3ework'
  },
  {
    username: 'EJM-Company'
  },
  {
    username: 'Nelie-Taylor'
  },
  {
    username: 'fortezhuo'
  },
  {
    username: 'nshelia'
  },
  {
    username: 'marcusway'
  },
  {
    username: 'edikdeisling'
  },
  {
    username: 'AurelienLourot'
  },
  {
    username: 'jahredhope'
  },
  {
    username: 'charlieforward9'
  },
  {
    username: 'leonmondria'
  },
  {
    username: 'jscottsf'
  },
  {
    username: 'micah-redwood'
  },
  {
    username: 'nicka-redwood'
  },
  {
    username: 'ser1us'
  },
  {
    username: 'nikitavoloboev'
  },
  {
    username: 'samuelstroschein'
  },
  {
    username: 'npacucci'
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

const companies: Sponsor[] = [
  {
    companyName: 'BurdaFoward',
    companyLogo: burdaforwardLogo,
    plan: 'platinum',
    website: 'https://www.burda-forward.de',
    username: 'BurdaForward'
  },
  {
    companyName: 'Contra',
    companyLogo: contraLogo,
    plan: 'silver',
    website: 'https://contra.com',
    username: 'contra'
  },
  {
    companyName: 'Alignable',
    companyLogo: alignableLogo,
    plan: 'silver',
    website: 'https://www.alignable.com/',
    username: 'AlignableUser'
  },
  {
    companyName: 'Optimizers',
    companyLogo: optimizersLogo,
    plan: 'bronze',
    website: 'https://www.optimizers.nl/',
    divSize: {
      padding: 20
    },
    username: 'OptimizersGroup'
  },
  {
    companyName: 'My Favorite Quilt Store',
    companyLogo: mfqsLogo,
    plan: 'indie',
    website: 'https://myfavoritequiltstore.com',
    username: 'pieperz'
  },
  {
    companyName: 'Inlang',
    companyLogo: inlangLogo,
    plan: 'indie',
    website: 'https://inlang.com/',
    username: 'inlang'
  }
]

const sponsorsList: Sponsor[] = [...companies, ...individuals]
