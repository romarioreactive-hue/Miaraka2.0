export type PersonGroup = 'famille' | 'amis' | 'equipe';

export type TimelineEvent = {
  time: string;
  type: 'depart' | 'arrivee';
  label: string;
  place: string;
};

export type Person = {
  id: string;
  name: string;
  isMe?: boolean;
  group: PersonGroup;
  initials: string;
  color: string;
  position: { top: `${number}%`; left: `${number}%` };
  location: string;
  movementStatus: string;
  speedKmh: number;
  lastUpdate: string;
  eta: string;
  battery: number;
  steps: number;
  weeklyKm: number;
  challenge: { name: string; progress: number };
  timeline: TimelineEvent[];
};

export const GROUP_LABELS: Record<PersonGroup, string> = {
  famille: 'Famille',
  amis: 'Amis',
  equipe: 'Équipe',
};

// Couleur sémantique par groupe (utilisée pour le badge "groupe" dans la fiche).
export const GROUP_COLORS: Record<PersonGroup, string> = {
  famille: '#17C964',
  amis: '#4C89FF',
  equipe: '#FFB020',
};

// Palette relevée sur les maquettes : nuit bleutée, bleu région, corail alerte,
// vert sécurité, or en route, brume claire.
export const PALETTE = {
  navy: '#071022',
  navySurface: '#101B33',
  blueRegion: '#4C89FF',
  coralAlert: '#FF6B6B',
  greenSafety: '#17C964',
  amberRoute: '#FFB020',
  mist: '#E7ECF5',
  textSecondary: '#8C97B8',
} as const;

// Couleur d'identité par personne (utilisée pour les marqueurs et l'anneau d'avatar).
export const PERSON_COLORS: Record<string, string> = {
  moi: PALETTE.mist,
  rica: '#7C6CF0',
  papa: PALETTE.blueRegion,
  mario: PALETTE.greenSafety,
  taratra: PALETTE.amberRoute,
  maman: '#F2679D',
};

export const PEOPLE: Person[] = [
  {
    id: 'moi',
    name: 'Moi',
    isMe: true,
    group: 'famille',
    initials: 'M',
    color: PERSON_COLORS.moi,
    position: { top: '52%', left: '48%' },
    location: 'Analakely, Antananarivo',
    movementStatus: 'En ville',
    speedKmh: 5,
    lastUpdate: "à l'instant",
    eta: '—',
    battery: 82,
    steps: 4210,
    weeklyKm: 12.6,
    challenge: { name: 'Foulées d’été', progress: 54 },
    timeline: [
      { time: '08:15', type: 'depart', label: 'a quitté la maison', place: 'Ambohipo' },
      { time: '08:41', type: 'arrivee', label: 'est arrivé à', place: 'Analakely' },
    ],
  },
  {
    id: 'rica',
    name: 'Rica',
    group: 'amis',
    initials: 'R',
    color: PERSON_COLORS.rica,
    position: { top: '32%', left: '28%' },
    location: 'Ivandry, Antananarivo',
    movementStatus: 'En route',
    speedKmh: 18,
    lastUpdate: 'il y a 2 min',
    eta: '8 min',
    battery: 64,
    steps: 6830,
    weeklyKm: 18.4,
    challenge: { name: 'Foulées d’été', progress: 72 },
    timeline: [
      { time: '07:50', type: 'depart', label: 'a quitté', place: 'Antaninarenina' },
      { time: '08:20', type: 'arrivee', label: 'roule vers', place: 'Ivandry' },
    ],
  },
  {
    id: 'mario',
    name: 'Mario',
    group: 'equipe',
    initials: 'MA',
    color: PERSON_COLORS.mario,
    position: { top: '68%', left: '62%' },
    location: 'Ankorondrano, Antananarivo',
    movementStatus: 'En route',
    speedKmh: 34,
    lastUpdate: 'il y a 5 min',
    eta: '14 min',
    battery: 12,
    steps: 3120,
    weeklyKm: 9.1,
    challenge: { name: 'Défi équipe Nord', progress: 38 },
    timeline: [
      { time: '07:42', type: 'depart', label: 'a quitté le bureau', place: 'Ankorondrano' },
      { time: '08:07', type: 'arrivee', label: 'est arrivé à', place: 'Andraharo' },
    ],
  },
  {
    id: 'taratra',
    name: 'Taratra',
    group: 'amis',
    initials: 'T',
    color: PERSON_COLORS.taratra,
    position: { top: '22%', left: '66%' },
    location: 'Antaninarenina, Antananarivo',
    movementStatus: "À l'école",
    speedKmh: 0,
    lastUpdate: 'il y a 1 min',
    eta: '5 min',
    battery: 93,
    steps: 8940,
    weeklyKm: 21.7,
    challenge: { name: 'Foulées d’été', progress: 88 },
    timeline: [
      { time: '07:05', type: 'depart', label: 'a quitté la maison', place: 'Isotry' },
      { time: '07:28', type: 'arrivee', label: 'est arrivée à', place: "l'école" },
    ],
  },
  {
    id: 'papa',
    name: 'Papa',
    group: 'famille',
    initials: 'P',
    color: PERSON_COLORS.papa,
    position: { top: '74%', left: '30%' },
    location: 'Ambohipo, Antananarivo',
    movementStatus: 'Au bureau',
    speedKmh: 0,
    lastUpdate: 'il y a 10 min',
    eta: '20 min',
    battery: 57,
    steps: 2450,
    weeklyKm: 6.3,
    challenge: { name: 'Foulées d’été', progress: 29 },
    timeline: [
      { time: '07:30', type: 'depart', label: 'a quitté la maison', place: 'Ambohipo' },
      { time: '07:58', type: 'arrivee', label: 'est arrivé au bureau', place: 'Ambohipo' },
    ],
  },
  {
    id: 'maman',
    name: 'Maman',
    group: 'famille',
    initials: 'MM',
    color: PERSON_COLORS.maman,
    position: { top: '40%', left: '52%' },
    location: 'Analakely, Antananarivo',
    movementStatus: 'À la maison',
    speedKmh: 0,
    lastUpdate: 'il y a 3 min',
    eta: '9 min',
    battery: 76,
    steps: 5390,
    weeklyKm: 14.9,
    challenge: { name: 'Foulées d’été', progress: 61 },
    timeline: [
      { time: '09:10', type: 'depart', label: 'a quitté le marché', place: 'Analakely' },
      { time: '09:35', type: 'arrivee', label: 'est arrivée à la maison', place: 'Analakely' },
    ],
  },
];
