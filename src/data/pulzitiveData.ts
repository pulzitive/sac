import productionSetImg from '@/src/assets/images/nigerian_production_set_1794581970426.jpg';
import academyAtelierImg from '@/src/assets/images/nigerian_academy_atelier_1794581971249.jpg';

export type PortfolioCategory =
  | 'all'
  | 'branding'
  | 'campaigns'
  | 'uiux'
  | 'motion'
  | 'logofolio';

export interface ProjectGalleryFrame {
  src: string;
  caption: string;
  objectPosition?: 'center' | 'top';
}

export interface PortfolioProject {
  id: string;
  title: string;
  client: string;
  category: Exclude<PortfolioCategory, 'all' | 'logofolio'>;
  disciplineLabel: string;
  year: string;
  featuredSpan?: 'wide' | 'standard';
  coverSrc: string;
  coverPosition?: 'center' | 'top';
  summary: string;
  challenge: string;
  outcomeMetric: string;
  deliverables: string[];
  driveUrl: string;
  videoPreviewId?: string;
  gallery: ProjectGalleryFrame[];
}

export interface LogofolioMark {
  id: string;
  name: string;
  sector: string;
  year: string;
  src: string;
  notes: string;
}

export interface CapabilityItem {
  number: string;
  title: string;
  summary: string;
  deliverables: string[];
  portfolioCategory: PortfolioCategory;
  imageSrc: string;
  imageAlt: string;
  span: 'wide' | 'standard';
}

export interface AcademyModule {
  week: string;
  title: string;
  topics: string;
}

export interface AcademyTrack {
  id: string;
  number: string;
  title: string;
  duration: string;
  format: string;
  mentor: string;
  summary: string;
  caseReference: string;
  outcomes: string[];
  modules: AcademyModule[];
}

export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  organization: string;
  outcome: string;
}

export const STUDIO_MEDIA = {
  heroStudio: './assets/aistudio/Nigerian_Creative_Team_Collaboration_0b0b9b5d.png',
  productionSet: productionSetImg,
  academyAtelier: academyAtelierImg,
  founderPortrait: './drive-assets/founder_portrait.png',
  resumePdfUrl: './drive-assets/Salami-Abiodun-Resume.pdf',
  resumeDriveUrl:
    'https://drive.google.com/file/d/1f4Fetfvsly-JBjR-CWCdhVm8pD40KrMz/view',
  driveRootUrl:
    'https://drive.google.com/drive/folders/1kTY9MiqQvWSVYl7nFSVP3pXwqgtpnaRw?usp=sharing',
};

export const HERO_METRICS = [
  { value: '40+', label: 'Brand Identities & Design Systems Shipped' },
  { value: '12M+', label: 'Audience Impressions Across Print, OOH & Digital' },
  { value: '18', label: 'Commercial Media & Motion Productions Directed' },
  { value: '9', label: 'Fintech, Banking & Enterprise Growth Partners' },
];

export const CLIENT_ROSTER = [
  'Access Bank',
  'Custodian Investment',
  'Sparkle MFB',
  'CardinalStone',
  'Traction Apps',
  'VAVADI® Watches',
  'OMAGBADA by Omawumi',
  'Lily Hospitals',
  'Red Star Express',
  'Sofri Fintech',
  'Coolcart.co.za',
  'Mansour Homes & Estates',
];

export const CAPABILITIES: CapabilityItem[] = [
  {
    number: '01.',
    title: 'Brand Identity & Visual Architecture',
    summary:
      'Complete identity systems built for high-trust consumer and luxury brands—from foundational wordmarks and monograms to tactile packaging, environmental signage, and print monographs.',
    deliverables: [
      'Identity Systems & Logofolio',
      'Luxury Packaging & Print',
      'Environmental & 3D Signage',
    ],
    portfolioCategory: 'branding',
    imageSrc: './drive-assets/vavadi_3d_sign.jpg',
    imageAlt: 'VAVADI three-dimensional architectural wall signage designed by Pulzitive',
    span: 'wide',
  },
  {
    number: '02.',
    title: 'Digital Marketing & Campaign Direction',
    summary:
      'Conversion-engineered campaign creative across OOH billboards, paid acquisition, and enterprise retail banking communications for financial and high-growth consumer leaders.',
    deliverables: [
      'Performance Ad Creative',
      'OOH & Retail Rollouts',
      'Multi-Channel Art Direction',
    ],
    portfolioCategory: 'campaigns',
    imageSrc: './drive-assets/access_internet_banking.png',
    imageAlt: 'Access Bank digital banking campaign art direction',
    span: 'standard',
  },
  {
    number: '03.',
    title: 'Media Production, Motion & 3D',
    summary:
      'Studio-lit product cinematography, kinetic brand teasers, and 3D explainer sequences designed to hold retention across flagship web hero placements and social launches.',
    deliverables: [
      'Commercial Video Direction',
      '3D Product & Stack Animation',
      'Teaser Reels & Kinetic Type',
    ],
    portfolioCategory: 'motion',
    imageSrc: productionSetImg,
    imageAlt: 'Pulzitive commercial cinema camera production set',
    span: 'standard',
  },
  {
    number: '04.',
    title: 'Product UI/UX & Digital Flagships',
    summary:
      'End-to-end web and mobile interface architecture for fintech lending, cooperative savings, and diaspora community platforms—engineered for clarity and conversion.',
    deliverables: [
      'Fintech Web Flagships',
      'iOS & Android Product UI',
      'Design Systems & Prototypes',
    ],
    portfolioCategory: 'uiux',
    imageSrc: './drive-assets/sofri_home.png',
    imageAlt: 'Sofri digital banking web flagship UI/UX design',
    span: 'wide',
  },
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'vavadi-watches',
    title: 'VAVADI® Golden Ecliptic — Luxury Horology Launch',
    client: 'VAVADI® Watches',
    category: 'branding',
    disciplineLabel: 'Brand Identity · Packaging · OOH Billboard',
    year: '2024',
    featuredSpan: 'wide',
    coverSrc: './drive-assets/vavadi_billboard.jpg',
    summary:
      'Full-spectrum luxury brand architecture for VAVADI® Watches, spanning sculpted monogram geometry, embossed presentation packaging, watch-back engraving specs, and national billboard art direction.',
    challenge:
      'Position an independent chronograph house beside established European heritage retailers at Norman Marshall through unmistakable visual authority.',
    outcomeMetric: '360° retail launch across 14 OOH placements and luxury packaging lines',
    deliverables: [
      'Architectural 3D Wall Signage',
      'Acurio V7 Chronograph OOH Billboard',
      'Rigid Presentation Packaging Box',
      'Caseback Engraving & Promo Suite',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1JEZvegyugj9TUOpCftGCKBTdzNA7yhh7',
    gallery: [
      {
        src: './drive-assets/vavadi_billboard.jpg',
        caption: 'Golden Ecliptic Acurio V7 Chronograph — National OOH Billboard Campaign',
      },
      {
        src: './drive-assets/vavadi_3d_sign.jpg',
        caption: '3D Architectural Flagship Wall Signage',
      },
      {
        src: './drive-assets/vavadi_packaging.jpg',
        caption: 'Collector Packaging Box & Foil-Stamped Monogram',
      },
      {
        src: './drive-assets/vavadi_watch_back.jpg',
        caption: 'Precision Caseback Engraving Specification',
      },
      {
        src: './drive-assets/vavadi_promo_01.jpg',
        caption: 'Editorial Social & Retail Launch Key Visual',
      },
    ],
  },
  {
    id: 'omagbada-by-omawumi',
    title: 'OMAGBADA by Omawumi — Heritage Luxury Apparel',
    client: 'OMAGBADA',
    category: 'branding',
    disciplineLabel: 'Identity System · Tactile Print · Apparel Labels',
    year: '2024',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/omagbada_display.jpg',
    summary:
      'Bold geometric cultural identity for fashion house OMAGBADA by Omawumi, translating West African textile rhythm into a contemporary luxury system of woven labels, foil cards, and lookbook framing.',
    challenge:
      'Unify vibrant heritage motifs with disciplined minimalist garment labeling suitable for international fashion stockists.',
    outcomeMetric: 'Unified 12-piece packaging & woven garment trim suite for flagship collection',
    deliverables: [
      'Geometric Pattern System',
      'Woven Garment & Neck Labels',
      '3D Foil Thank-You Stationery',
      'Tabletop Retail Display Cards',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/13EsVTvrD-vPclaDD-KyWsGTS4W-ILj7y',
    gallery: [
      {
        src: './drive-assets/omagbada_display.jpg',
        caption: 'OMAGBADA Geometric Brand Pattern & Primary Wordmark',
      },
      {
        src: './drive-assets/omagbada_cards.jpg',
        caption: 'Tactile Thank-You Card & Packaging Suite',
      },
    ],
  },
  {
    id: 'la-lune-experiences',
    title: 'LA LUNE — Bespoke Cultural Events & Experiential Identity',
    client: 'La Lune Lagos',
    category: 'branding',
    disciplineLabel: 'Brand System · Event Posters · Ticketing',
    year: '2024',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/lalune_ticket.jpg',
    summary:
      'Atmospheric nocturnal visual identity and event collateral system for La Lune—covering Drive-In Movie Nights at The Podium Lekki, Pottery with Anne workshops, custom serialized tickets, and teaser reels.',
    challenge:
      'Create a cohesive yet versatile visual language capable of flexing across intimate pottery salons and large-scale outdoor cinema nights.',
    outcomeMetric: 'Sold-out seasonal calendar across 4 flagship Lagos experiential editions',
    deliverables: [
      'La Lune Celestial Wordmark & Stationery',
      'Serialized Admit-Four Perforated Tickets',
      'Drive-In & Outdoor Cinema Poster Series',
      'Pottery Workshop Key Visuals',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1OF2eW3vJj1V9R4a9NUKhb9D2yAAmtyeY',
    gallery: [
      {
        src: './drive-assets/lalune_ticket.jpg',
        caption: 'Serialized Drive-In Movie Night Admit-Four Ticket System',
      },
      {
        src: './drive-assets/lalune_drivein_poster.jpg',
        caption: 'La Lune Drive-In Movie Night — Key Campaign Poster',
      },
      {
        src: './drive-assets/lalune_pottery_poster.png',
        caption: 'Pottery with Anne — Tactile Workshop Poster',
      },
      {
        src: './drive-assets/lalune_logo.jpg',
        caption: 'Primary Brand Mark & Nocturnal Color Palette',
      },
    ],
  },
  {
    id: 'disruptdna-enterprise-campaigns',
    title: 'DisruptDNA × Access Bank & Enterprise Finance',
    client: 'Access Bank · Custodian · Sparkle · CardinalStone',
    category: 'campaigns',
    disciplineLabel: 'Performance Marketing · Banking Campaigns',
    year: '2024',
    featuredSpan: 'wide',
    coverSrc: './drive-assets/access_internet_banking.png',
    summary:
      'High-velocity multi-channel campaign creative directed via DisruptDNA for Nigeria’s premier financial institutions—spanning Access Bank Internet Banking, QuickBucks × Konga, XtraWins, and Custodian HealthXtra.',
    challenge:
      'Distill complex retail banking, remittance, insurance, and multi-tenure loan offerings into immediate, high-converting digital visuals.',
    outcomeMetric: '35+ production campaign suites deployed across national digital and retail channels',
    deliverables: [
      'Access Bank Internet Banking & Solo Account',
      'QuickBucks × Konga Co-Branded Acquisition',
      'HealthXtra & Householder Insurance Suites',
      'XtraWins Transact & Win Rollout',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1YrQ0GTGMVu90jswAWV9EuN9bY4vEj4xZ',
    gallery: [
      {
        src: './drive-assets/access_internet_banking.png',
        caption: 'Access Bank Internet Banking — "More Control" Campaign Creative',
      },
      {
        src: './drive-assets/phxfest_poster.jpg',
        caption: 'PHXFEST High-Impact Cultural Festival Campaign Poster',
      },
      {
        src: './drive-assets/the_cool_off_poster.jpg',
        caption: 'The Cool Off — Seasonal Lifestyle Campaign Key Visual',
      },
    ],
  },
  {
    id: 'sofri-fintech-flagship',
    title: 'Sofri — Borderless Digital Banking Web Flagship',
    client: 'Sofri Fintech',
    category: 'uiux',
    disciplineLabel: 'Product UI/UX · Conversion Architecture',
    year: '2024',
    featuredSpan: 'wide',
    coverSrc: './drive-assets/sofri_home.png',
    coverPosition: 'top',
    summary:
      'Complete digital banking marketing site and product flow architecture for Sofri—unifying Nano Loans, Car Loans, Rent Loans, Salary Express, and Virtual Mastercard onboarding inside a crystal-clear web experience.',
    challenge:
      'Replace fragmented loan landing pages with one cohesive, high-trust digital flagship that explains eligibility in under 15 seconds.',
    outcomeMetric: '12 interconnected product & loan flows unified under one design system',
    deliverables: [
      'Full Marketing Flagship Architecture',
      'Loan Vertical Landing Pages (Car, Rent, Nano)',
      '4-Step Onboarding & Card Showcase',
      'Investment & ROI Calculator Modules',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1sBoNFBDrQpI8CO5H5RyjSDZ6Pb8lS53_',
    gallery: [
      {
        src: './drive-assets/sofri_home.png',
        caption: 'Sofri Flagship Homepage — Full Responsive Experience',
        objectPosition: 'top',
      },
    ],
  },
  {
    id: 'fruithaven-packaging',
    title: 'FruitHaven™ — Cold-Pressed Beverage Identity & OOH',
    client: 'FruitHaven™',
    category: 'branding',
    disciplineLabel: 'Packaging Design · OOH Billboard · FMCG',
    year: '2023',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/fruithaven_billboard.jpg',
    summary:
      'Vibrant, shelf-dominant packaging and billboard identity for FruitHaven™ artisanal juices across Mango, Lemon, Orange, and Strawberry SKUs.',
    challenge:
      'Stand out cleanly in crowded supermarket chillers and fast-moving urban highway billboards simultaneously.',
    outcomeMetric: '4 core beverage SKUs + outdoor launch campaign delivered',
    deliverables: [
      'FruitHaven™ Brand Mark & Color System',
      '4-Flavor Bottle Label Architecture',
      'Highway Billboard & Retail Posters',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1LuOZuz5AKw7FVsQEktX_Q70KBh46hm6c',
    gallery: [
      {
        src: './drive-assets/fruithaven_billboard.jpg',
        caption: 'FruitHaven™ National OOH Billboard Campaign',
      },
      {
        src: './drive-assets/fruithaven_mango.jpg',
        caption: 'Mango SKU Bottle Packaging & Label Craft',
      },
    ],
  },
  {
    id: 'kadajo-mobile-fintech',
    title: 'Kadajo — Cooperative Savings & Budgeting App',
    client: 'Kadajo',
    category: 'uiux',
    disciplineLabel: 'Mobile UI/UX · Fintech Product Design',
    year: '2023',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/kadajo_dashboard.png',
    coverPosition: 'top',
    summary:
      'End-to-end iOS and Android product design for Kadajo—modernizing traditional Ajo group savings, automated budgeting analytics, and peer wallet transfers.',
    challenge:
      'Make collective savings rules, payout schedules, and inflow/outflow tracking effortless for first-time mobile savers.',
    outcomeMetric: '10 core mobile product screens spanning onboarding, Ajo groups & analytics',
    deliverables: [
      'Mobile Design System & Iconography',
      'Group Savings (Ajo) Discovery Flow',
      'Inflow vs. Outflow Budget Analytics',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1DxljIcg1H3WTPafftXFfHiqGAquOiTtQ',
    gallery: [
      {
        src: './drive-assets/kadajo_dashboard.png',
        caption: 'Kadajo Mobile Dashboard, Group Savings & Budget Analytics',
        objectPosition: 'top',
      },
    ],
  },
  {
    id: 'motherland-community-platform',
    title: 'Motherland — Global Diaspora Community Platform',
    client: 'Motherland',
    category: 'uiux',
    disciplineLabel: 'Web & Mobile UI/UX · Community Platform',
    year: '2023',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/motherland_home.png',
    summary:
      'Human-centered web application connecting relocated professionals abroad with verified local cultural communities, neighborhood forums, and real-time messaging.',
    challenge:
      'Turn country-to-country onboarding into a warm, immediate, frictionless discovery step right above the fold.',
    outcomeMetric: 'Complete 9-screen community web experience from onboarding to live chat',
    deliverables: [
      'Geo-Matching Hero & Onboarding Flow',
      'Community Explore & Forum Architecture',
      'Real-Time Messaging Interface',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/14OuJ1jVidB1EX2_xZrHiGCeyxJ2mei3m',
    gallery: [
      {
        src: './drive-assets/motherland_home.png',
        caption: 'Motherland Diaspora Matching Hero & Web Experience',
      },
    ],
  },
  {
    id: 'editorial-posters-print',
    title: 'PHXFEST, Red Rain & Cultural Print Series',
    client: 'PHXFEST · Red Rain · The Cool Off',
    category: 'campaigns',
    disciplineLabel: 'Editorial Posters · Event Art Direction',
    year: '2024',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/phxfest_poster.jpg',
    summary:
      'Curated print and digital poster series spanning major music festivals, photography exhibitions, and urban lifestyle gatherings.',
    challenge:
      'Command immediate visual attention in both high-res print formats and compressed social feeds.',
    outcomeMetric: '12 bespoke event & exhibition posters shipped across Lagos & Abuja',
    deliverables: [
      'PHXFEST Main Festival Poster',
      'Red Rain Photography Group Exhibition',
      'The Cool Off Main Visual Direction',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1bLpoPzvXD7Q5_-COSmhYzYni9O4NnBpe',
    gallery: [
      {
        src: './drive-assets/phxfest_poster.jpg',
        caption: 'PHXFEST — Headline Festival Poster Direction',
      },
      {
        src: './drive-assets/red_rain_poster.jpg',
        caption: 'Red Rain Photography Group — Exhibition Key Poster',
      },
      {
        src: './drive-assets/the_cool_off_poster.jpg',
        caption: 'The Cool Off — Main Event Poster',
      },
    ],
  },
  {
    id: 'chow-palace-mansour',
    title: 'Chow Palace & Mansour Homes — Hospitality & Real Estate',
    client: 'Chow Palace · Mansour Homes & Estates',
    category: 'branding',
    disciplineLabel: 'Hospitality & Real Estate Brand Identity',
    year: '2023',
    featuredSpan: 'standard',
    coverSrc: './drive-assets/mansour_01.png',
    summary:
      'Dual luxury sector brand systems: refined architectural real estate identity for Mansour Homes & Estates alongside rich culinary branding for Chow Palace Restaurants.',
    challenge:
      'Balance high-trust architectural permanence in property development with warm sensory appetite appeal in dining.',
    outcomeMetric: '26 Mansour visual assets + 17 Chow Palace brand & menu collaterals',
    deliverables: [
      'Mansour Property Identity & Social Suite',
      'Chow Palace Restaurant Visual System',
      'Editorial Collateral & Launch Assets',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/1WMG7NG2whsugqA_yEfeLUumZj1O3gINB',
    gallery: [
      {
        src: './drive-assets/mansour_01.png',
        caption: 'Mansour Homes & Estates — Architectural Visual Direction',
      },
      {
        src: './drive-assets/chow_palace_02.jpg',
        caption: 'Chow Palace Restaurants — Editorial Brand Collateral',
      },
      {
        src: './drive-assets/chow_palace_01.jpg',
        caption: 'Chow Palace Primary Identity Application',
      },
    ],
  },
  {
    id: 'motion-commercial-reels',
    title: 'Gesture Act I, Qore Stack & Commercial Motion Reels',
    client: 'Gesture · Qore · KoraPlay · TradeXSafely · CrossExchange',
    category: 'motion',
    disciplineLabel: 'Media Production · 3D Motion · Explainers',
    year: '2024',
    featuredSpan: 'wide',
    coverSrc: productionSetImg,
    summary:
      'Full-motion production archive encompassing commercial media production, 3D SaaS stack visualizations, fintech app launch promos, and kinetic brand intros.',
    challenge:
      'Translate abstract software infrastructure and consumer product benefits into compelling 30-to-60 second motion stories.',
    outcomeMetric: '18 commercial videos, 3D animations & explainer reels archived in Drive',
    deliverables: [
      'Gesture Promo Video — Act I Final',
      'Qore Stack 3D Animation',
      'KoraPlay & La Lune Teaser Reels',
      'TradeXSafely & CrossExchange App Promos',
    ],
    driveUrl:
      'https://drive.google.com/drive/folders/11idhf6TEs-Nszg8V6vhfAMioYjkw0YvN',
    videoPreviewId: '14pcgPUkAipRnC4yyCRndYOXebMGMykAu',
    gallery: [
      {
        src: productionSetImg,
        caption: 'Studio Cinema Lighting & Commercial Reel Production',
      },
      {
        src: './drive-assets/vavadi_promo_01.jpg',
        caption: 'High-Contrast Commercial Product Direction',
      },
    ],
  },
];

export const MOTION_REELS = [
  {
    id: '14pcgPUkAipRnC4yyCRndYOXebMGMykAu',
    title: 'Gesture Promo Video — Act I',
    client: 'Gesture',
    format: 'Commercial Media · 00:48',
  },
  {
    id: '1mrtKklienljU6SLgeuqCwXElFyatTwau',
    title: 'Qore Stack 3D Animation',
    client: 'Qore Fintech',
    format: '3D Motion · 00:35',
  },
  {
    id: '1CFTw8BUECjqCpb0cII8Q3bwzwQ5Yel0D',
    title: 'KoraPlay Teaser Animation',
    client: 'KoraPlay',
    format: 'Launch Teaser · 00:25',
  },
  {
    id: '1rLWMrT84mKfWH1ZTsplpZwBEf_d7nrCW',
    title: 'TradeXSafely Explainer Video',
    client: 'TradeXSafely',
    format: '2D Motion Explainer · 01:05',
  },
  {
    id: '1-_G3LS_qpWnGs28FNBNjdskPvG8oi2bL',
    title: 'Cross Exchange App Promo',
    client: 'CrossExchange',
    format: 'Product Motion · 00:30',
  },
  {
    id: '1Sc2uYAmIqPvymyiK34CnL-4SMKM3HKCF',
    title: 'La Lune Experiential Teaser',
    client: 'La Lune Lagos',
    format: 'Event Media · 00:40',
  },
];

export const LOGOFOLIO_MARKS: LogofolioMark[] = [
  {
    id: 'logo-vavadi',
    name: 'VAVADI®',
    sector: 'Luxury Horology',
    year: '2024',
    src: './drive-assets/logo_vavadi.jpg',
    notes: 'Architectural triple-ribbon V monogram engineered for physical watch dial & 3D signage.',
  },
  {
    id: 'logo-lalune',
    name: 'LA LUNE',
    sector: 'Cultural & Cinema Experiences',
    year: '2024',
    src: './drive-assets/logo_lalune.jpg',
    notes: 'Celestial serif-inspired lockup built for night-time screenings and tactile print.',
  },
  {
    id: 'logo-traescents',
    name: 'TraeScents',
    sector: 'Artisanal Fragrance',
    year: '2023',
    src: './drive-assets/logo_traescents.jpg',
    notes: 'Minimalist botanical wordmark designed for glass bottle etching and rigid boxes.',
  },
  {
    id: 'logo-overcast',
    name: 'Overcast',
    sector: 'Cloud & Media Tech',
    year: '2023',
    src: './drive-assets/logo_overcast.jpg',
    notes: 'Geometric atmospheric mark with crisp scale-down legibility at 16px favicon size.',
  },
  {
    id: 'logo-motherland',
    name: 'Motherland',
    sector: 'Global Diaspora Network',
    year: '2023',
    src: './drive-assets/logo_motherland.jpg',
    notes: 'Interlocking ribbon M symbolizing cross-border cultural connection.',
  },
  {
    id: 'logo-droga',
    name: 'Droga',
    sector: 'Modern Healthcare & Pharmacy',
    year: '2023',
    src: './drive-assets/logo_droga.jpg',
    notes: 'Clean clinical symbol balancing pharmaceutical trust with warm accessibility.',
  },
  {
    id: 'logo-aaoc',
    name: 'AAOC Exchange',
    sector: 'Digital Currency & FX',
    year: '2023',
    src: './drive-assets/logo_aaoc.png',
    notes: 'Directional precision mark for high-volume institutional and retail currency exchange.',
  },
  {
    id: 'logo-grape',
    name: 'GRAPE Lagos',
    sector: 'Hospitality & Lifestyle',
    year: '2023',
    src: './drive-assets/logo_grape.jpg',
    notes: 'Contemporary editorial wordmark crafted for Lagos dining and nightlife culture.',
  },
  {
    id: 'logo-gbpay',
    name: 'GBPay',
    sector: 'Cross-Border Payments',
    year: '2023',
    src: './drive-assets/logo_gbpay.jpg',
    notes: 'High-contrast fintech emblem optimized for mobile app icons and POS hardware.',
  },
  {
    id: 'logo-coolcart',
    name: 'CoolCart.co.za',
    sector: 'South African E-Commerce',
    year: '2023',
    src: './drive-assets/coolcart_logo.jpg',
    notes: 'Kinetic retail brand mark built for rapid delivery fleets and digital storefronts.',
  },
];

export const ACADEMY_TRACKS: AcademyTrack[] = [
  {
    id: 'brand-architecture',
    number: '01.',
    title: 'Brand Architecture & Identity Systems',
    duration: '12 Weeks',
    format: 'Studio Cohort · Live Critiques',
    mentor: 'Salami Abiodun — Founder & Creative Director',
    summary:
      'Master strategic brand positioning, bespoke logofolio geometry, editorial typography, packaging dielines, and C-suite client presentation decks.',
    caseReference: 'Deconstructs live agency files from VAVADI® Watches & OMAGBADA by Omawumi.',
    outcomes: [
      'Complete 3 museum-grade brand identity monographs',
      'Packaging dielines, 3D mockups & print press-readiness',
      'Client pricing, scope framing & executive pitch mastery',
    ],
    modules: [
      {
        week: 'Weeks 01–03',
        title: 'Strategic Discovery & Brand Positioning',
        topics: 'Competitive audits, category white space, verbal architecture, creative briefs.',
      },
      {
        week: 'Weeks 04–06',
        title: 'Logofolio Craft & Geometric Grids',
        topics: 'Optical balance, negative space, bespoke wordmarks, responsive icon systems.',
      },
      {
        week: 'Weeks 07–09',
        title: 'Packaging, Environmental & Print Systems',
        topics: 'Foil stamping, rigid box dielines, 3D wall signage, retail touchpoints.',
      },
      {
        week: 'Weeks 10–12',
        title: 'Flagship Portfolio & Live Client Defense',
        topics: 'Case study storytelling, rate cards, and capstone defense before agency directors.',
      },
    ],
  },
  {
    id: 'digital-marketing',
    number: '02.',
    title: 'Digital Marketing & Performance Creative',
    duration: '10 Weeks',
    format: 'Hybrid Studio · Campaign Lab',
    mentor: 'Pulzitive Growth & Performance Desk',
    summary:
      'Bridge the gap between sharp visual art direction and measurable acquisition—building multi-channel campaigns for fintech, retail banking, and consumer launches.',
    caseReference: 'Analyzes enterprise campaign rollouts for Access Bank, Traction Apps & CoolCart.',
    outcomes: [
      'Architect full-funnel paid & OOH campaign creative suites',
      'Write conversion-driven visual headlines and hook matrices',
      'Analyze ROAS, CTR fatigue, and rapid creative iteration loops',
    ],
    modules: [
      {
        week: 'Weeks 01–03',
        title: 'Campaign Strategy & Consumer Psychology',
        topics: 'Audience segmentation, message hierarchy, offer framing, OOH vs. social formats.',
      },
      {
        week: 'Weeks 04–07',
        title: 'High-Converting Ad & Fintech Rollouts',
        topics: 'Static carousels, co-branded promos, compliance-ready financial creative.',
      },
      {
        week: 'Weeks 08–10',
        title: 'Attribution, Testing & Growth Retainers',
        topics: 'A/B creative sprints, creative reporting dashboards, agency retainer structures.',
      },
    ],
  },
  {
    id: 'creative-production',
    number: '03.',
    title: 'Commercial Content, Motion & 3D Direction',
    duration: '12 Weeks',
    format: 'In-Studio Production · Cinema Lab',
    mentor: 'Pulzitive Media & Motion Unit',
    summary:
      'Hands-on mastery of studio lighting, commercial art direction, kinetic typography, and 3D product animation for high-ticket brand launches.',
    caseReference: 'Built around production workflows from Gesture Act I, Qore Stack & La Lune.',
    outcomes: [
      'Direct and light commercial product shoots from storyboard to color grade',
      'Produce 3D SaaS & product launch teasers in After Effects and Blender',
      'Deliver broadcast-ready sound-designed brand reels',
    ],
    modules: [
      {
        week: 'Weeks 01–04',
        title: 'Cinematography, Lighting & Set Direction',
        topics: 'Tungsten & silk modifiers, lens selection, Leica-grade color pipelines.',
      },
      {
        week: 'Weeks 05–08',
        title: 'Kinetic Typography & 3D Product Motion',
        topics: 'Timing curves, camera choreography, 3D stack & hardware renders.',
      },
      {
        week: 'Weeks 09–12',
        title: 'Commercial Capstone Production',
        topics: 'Full 45-second studio spot produced, edited, graded, and mastered by your pod.',
      },
    ],
  },
  {
    id: 'product-uiux',
    number: '04.',
    title: 'Product UI/UX & Digital Flagships',
    duration: '12 Weeks',
    format: 'Studio Cohort · Figma & Systems',
    mentor: 'Pulzitive Digital Product Lead',
    summary:
      'Design high-trust fintech platforms, consumer mobile apps, and editorial web flagships backed by scalable Figma component tokens and interactive prototypes.',
    caseReference: 'Dissects live product architecture from Sofri Fintech, Kadajo & Motherland.',
    outcomes: [
      'Ship one complete web flagship and one mobile fintech product',
      'Build multi-brand Figma variable token libraries',
      'Run structured usability critiques and engineering handoff specs',
    ],
    modules: [
      {
        week: 'Weeks 01–04',
        title: 'Information Architecture & Fintech UX Flows',
        topics: 'Frictionless onboarding, KYC clarity, complex financial tables & calculators.',
      },
      {
        week: 'Weeks 05–08',
        title: 'Visual Systems, Typography & Micro-Interactions',
        topics: 'Grid discipline, responsive breakpoints, accessible contrast, Figma variables.',
      },
      {
        week: 'Weeks 09–12',
        title: 'Interactive Prototyping & Engineering Handoff',
        topics: 'Motion specs, component documentation, capstone product defense.',
      },
    ],
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'Before partnering with Pulzitive, our retail loan products lived across disconnected microsites. Their team unified twelve financial verticals into one flagship experience that made complex lending clear in seconds.',
    name: 'Tunde Adeyemi',
    role: 'Head of Digital Growth',
    organization: 'Sofri Financial Services',
    outcome: '12 product verticals unified under one flagship conversion architecture',
  },
  {
    quote:
      'Pulzitive translated our horology vision into architectural signage, collector packaging, and national billboards that immediately commanded shelf authority alongside international watchmakers.',
    name: 'Kolawole Balogun',
    role: 'Brand Director',
    organization: 'VAVADI® Watches',
    outcome: 'Full 360° luxury launch across 14 OOH placements and bespoke retail packaging',
  },
  {
    quote:
      'Moving from self-taught freelance design into Pulzitive Academy changed how I structure client briefs and typography systems. Within six weeks of graduating, I transitioned into a senior brand role.',
    name: 'Chidinma Okafor',
    role: 'Senior Brand Designer (Cohort 04 Alumna)',
    organization: 'Paystack Partner Studio',
    outcome: 'Transitioned from solo freelancer to senior brand lead within 45 days',
  },
];
