export { sponsorsList }

import type { Sponsor } from '../Sponsors'
import crepeLogo from './companyLogos/crepe.svg'
import contraLogo from './companyLogos/contra.svg'
import mfqsLogo from './companyLogos/mfqs.svg'
import optimizersLogo from './companyLogos/optimizers.svg'
import reporaLogo from './companyLogos/repora.svg'
import burdaforwardLogo from './companyLogos/burdaforward.png'
import inlangLogo from './companyLogos/inlang.png'

const individuals: Sponsor[] = [
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
    website: 'https://www.burda-forward.de'
  },
  {
    companyName: 'Contra',
    companyLogo: contraLogo,
    plan: 'gold',
    website: 'https://contra.com'
  },
  {
    companyName: 'CREPE',
    companyLogo: crepeLogo,
    plan: 'silver',
    website: 'https://crepe.cm'
  },
  {
    companyName: 'Optimizers',
    companyLogo: optimizersLogo,
    plan: 'bronze',
    website: 'https://www.optimizers.nl/',
    divSize: {
      padding: 20
    }
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
  }
]

const sponsorsList: Sponsor[] = [...companies, ...individuals]
