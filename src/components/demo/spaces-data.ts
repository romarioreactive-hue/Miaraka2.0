import { groupColors } from '@/theme';

export type SpaceType = 'famille' | 'amis' | 'equipe';
export type SharingLevel = 'Position précise' | 'Zone approximative' | 'Activité uniquement';
export type MemberStatus = 'En direct' | 'Dernière position' | 'Hors ligne';

export type SpaceMember = {
  id: string;
  name: string;
  initials: string;
  status: MemberStatus;
  position: string;
  updatedAt: string;
  weeklyActivity: string;
};

export type Space = {
  id: string;
  name: string;
  type: SpaceType;
  icon: string;
  color: string;
  mainPlace: string;
  sharingLevel: SharingLevel;
  weeklyActivity: string;
  challenge: {
    name: string;
    progress: number;
    detail: string;
  };
  members: SpaceMember[];
};

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  famille: 'Famille',
  amis: 'Amis',
  equipe: 'Équipe',
};

export const SPACE_COLORS: Record<SpaceType, string> = {
  famille: groupColors.family,
  amis: groupColors.friends,
  equipe: groupColors.team,
};

export const SPACES: Space[] = [
  {
    id: 'famille',
    name: 'Famille',
    type: 'famille',
    icon: '⌂',
    color: SPACE_COLORS.famille,
    mainPlace: 'Maison · Antananarivo',
    sharingLevel: 'Position précise',
    weeklyActivity: '186 km parcourus ensemble',
    challenge: { name: 'Balade du dimanche', progress: 72, detail: '36 km sur 50 km' },
    members: [
      { id: 'aina', name: 'Aina', initials: 'AI', status: 'En direct', position: 'Maison', updatedAt: 'À l’instant', weeklyActivity: '42,8 km' },
      { id: 'mamy', name: 'Mamy', initials: 'MA', status: 'En direct', position: 'Analakely', updatedAt: 'Il y a 2 min', weeklyActivity: '38,2 km' },
      { id: 'fara', name: 'Fara', initials: 'FA', status: 'Dernière position', position: 'Lycée Andohalo', updatedAt: 'Il y a 28 min', weeklyActivity: '31,6 km' },
      { id: 'tovo', name: 'Tovo', initials: 'TO', status: 'Hors ligne', position: 'Ivandry', updatedAt: 'Hier à 21:14', weeklyActivity: '27,9 km' },
      { id: 'sofia', name: 'Sofia', initials: 'SO', status: 'Dernière position', position: 'Ambohijatovo', updatedAt: 'Il y a 1 h', weeklyActivity: '45,5 km' },
    ],
  },
  {
    id: 'amis',
    name: 'Amis',
    type: 'amis',
    icon: '✦',
    color: SPACE_COLORS.amis,
    mainPlace: 'Centre-ville',
    sharingLevel: 'Zone approximative',
    weeklyActivity: '94 km parcourus ensemble',
    challenge: { name: '10 000 pas entre amis', progress: 84, detail: '84 000 pas sur 100 000' },
    members: [
      { id: 'ranto', name: 'Ranto', initials: 'RA', status: 'En direct', position: 'Tsaralalàna', updatedAt: 'À l’instant', weeklyActivity: '29,1 km' },
      { id: 'lina', name: 'Lina', initials: 'LI', status: 'Dernière position', position: 'Isoraka', updatedAt: 'Il y a 12 min', weeklyActivity: '24,7 km' },
      { id: 'andry', name: 'Andry', initials: 'AN', status: 'En direct', position: 'Antaninarenina', updatedAt: 'Il y a 3 min', weeklyActivity: '21,8 km' },
      { id: 'miora', name: 'Miora', initials: 'MI', status: 'Hors ligne', position: 'Ankorondrano', updatedAt: 'Hier à 18:40', weeklyActivity: '18,4 km' },
    ],
  },
  {
    id: 'equipe',
    name: 'Équipe',
    type: 'equipe',
    icon: '◆',
    color: SPACE_COLORS.equipe,
    mainPlace: 'Bureau · Ankorondrano',
    sharingLevel: 'Activité uniquement',
    weeklyActivity: '248 km parcourus ensemble',
    challenge: { name: 'Cap sur 300 km', progress: 83, detail: '248 km sur 300 km' },
    members: [
      { id: 'riva', name: 'Riva', initials: 'RI', status: 'En direct', position: 'Bureau', updatedAt: 'À l’instant', weeklyActivity: '58,3 km' },
      { id: 'noro', name: 'Noro', initials: 'NO', status: 'Dernière position', position: 'Zone partagée', updatedAt: 'Il y a 18 min', weeklyActivity: '52,1 km' },
      { id: 'hery', name: 'Hery', initials: 'HE', status: 'En direct', position: 'Bureau', updatedAt: 'Il y a 1 min', weeklyActivity: '49,7 km' },
      { id: 'saholy', name: 'Saholy', initials: 'SA', status: 'Dernière position', position: 'Zone partagée', updatedAt: 'Il y a 43 min', weeklyActivity: '46,5 km' },
      { id: 'luc', name: 'Luc', initials: 'LU', status: 'Hors ligne', position: 'Non disponible', updatedAt: 'Lundi à 09:20', weeklyActivity: '41,4 km' },
    ],
  },
];

export function getActiveMemberCount(space: Space) {
  return space.members.filter((member) => member.status === 'En direct').length;
}
