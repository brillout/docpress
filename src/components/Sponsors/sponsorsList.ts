export { sponsorsList }

import type { Sponsor } from '../Sponsors'
import contraLogo from './companyLogos/contra.svg'
import mfqsLogo from './companyLogos/mfqs.svg'
import optimizersLogo from './companyLogos/optimizers.svg'
// import burdaforwardLogo from './companyLogos/burdaforward.png'
import inlangLogo from './companyLogos/inlang.png'
import bluefinLogo from './companyLogos/bluefin.svg'
import alignableLogo from './companyLogos/alignable.svg'

const individuals: Sponsor[] = [
  { username: 'msiegenthaler' },
  { username: 'linkyard' },
  { username: 'AnukarOP' },
  { username: 'RoyMcCrain' },
  { username: 'BurdaForward' },
  { username: 'chrisvander' },
  { username: 'EralChen' },
  { username: '3dyuval' },
  { username: 'talzion12' },
  { username: 'felixhaeberle' },
  { username: 'apappas1129' },
  { username: 'agalbenus' },
  { username: 'phiberber' },
  { username: 'cookieplace' },
  { username: 'JiangWeixian' },
  { username: 'harrytran998' },
  { username: 'royalswe' },
  { username: 'alexturpin' },
  { username: 'gu-stav' },
  { username: 'YannBirba' },
  { username: 'fi3ework' },
  { username: 'EJM-Company' },
  { username: 'Nelie-Taylor' },
  { username: 'fortezhuo' },
  { username: 'nshelia' },
  { username: 'marcusway' },
  { username: 'edikdeisling' },
  { username: 'AurelienLourot' },
  { username: 'jahredhope' },
  { username: 'charlieforward9' },
  { username: 'leonmondria' },
  { username: 'jscottsf' },
  { username: 'micah-redwood' },
  { username: 'nicka-redwood' },
  { username: 'ser1us' },
  { username: 'nikitavoloboev' },
  { username: 'samuelstroschein' },
  { username: 'npacucci' },
  { username: 'szarapka' },
  { username: 'techniath' },
  { username: 'DannyZB' },
  { username: 'pieperz' },
  { username: 'hemengke1997' },
  { username: 'spacedawwwg' },
  { username: 'arthurgailes' },
  { username: 'stackblitz' },
  { username: 'codthing' },
  { username: 'Junaidhkn' },
  { username: 'zgfdev' }
]

const companies: Sponsor[] = [
  /*
  {
    companyName: 'BurdaFoward',
    companyLogo: burdaforwardLogo,
    plan: 'platinum',
    website: 'https://www.burda-forward.de',
    github: 'BurdaForward'
  },
  */
  {
    companyName: 'Contra',
    companyLogo: contraLogo,
    plan: 'silver',
    website: 'https://contra.com',
    github: 'contra'
  },
  {
    companyName: 'Alignable',
    companyLogo: alignableLogo,
    plan: 'silver',
    website: 'https://www.alignable.com/',
    github: 'AlignableUser'
  },
  {
    companyName: 'Optimizers',
    companyLogo: optimizersLogo,
    plan: 'bronze',
    website: 'https://www.optimizers.nl/',
    divSize: {
      padding: 20
    },
    github: 'OptimizersGroup'
  },
  {
    companyName: 'My Favorite Quilt Store',
    companyLogo: mfqsLogo,
    plan: 'indie',
    website: 'https://myfavoritequiltstore.com',
    github: 'pieperz'
  },
  {
    companyName: 'Inlang',
    companyLogo: inlangLogo,
    plan: 'indie',
    website: 'https://inlang.com/',
    github: 'inlang'
  },
  {
    companyName: 'Bluefin',
    companyLogo: bluefinLogo,
    plan: 'indie',
    website: 'https://https://www.bluefin.one',
    github: 'bluefin-clinical'
  }
]

const sponsorsList: Sponsor[] = [...companies, ...individuals]
