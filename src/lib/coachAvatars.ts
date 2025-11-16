import teacherIcon from '../assets/image copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy copy.png';

export interface CoachAvatarPreset {
  id: string;
  name: string;
  image: string;
  description: string;
}

export const COACH_AVATAR_PRESETS: CoachAvatarPreset[] = [
  {
    id: 'teacher',
    name: '先生',
    image: teacherIcon,
    description: '真面目で丁寧な指導スタイル',
  },
];

export const getCoachAvatarById = (id: string): string => {
  const preset = COACH_AVATAR_PRESETS.find(p => p.id === id);
  return preset?.image || COACH_AVATAR_PRESETS[0].image;
};
