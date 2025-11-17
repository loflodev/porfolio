import useTranslation from '../../hooks/useTransalation';
import type { SkillType, TimelineType } from '../../types';

const useResume = () => {
  const { t } = useTranslation();
  const education: TimelineType[] = [
    {
      title: 'Alterna Academy',
      time: '2022 — 2023',
      description: t('resumePage.education1'),
    },
    {
      title: 'Instituto Tecnológico de Las Américas ITLA',
      time: '2014 — 2016',
      description: t('resumePage.education2'),
    },
    {
      title: 'Cisco Certified Network Associate (CCNA)',
      time: '2012 — 2014',
      description: t('resumePage.education3'),
    },
  ];

  const experience: TimelineType[] = [
    {
      title: 'Project‑based developer',
      time: '2024 — Present',
      description: t('resumePage.experience1'),
    },
    {
      title: 'Full stack Developer - Productiviy',
      time: '2023 — 2024',
      description: t('resumePage.experience2'),
    },
    {
      title: 'Frontend Developer - CoolHunter Partner',
      time: '2022 - 2023',
      description: t('resumePage.experience1'),
    },
  ];

  const skills: SkillType[] = [
    { title: t('webDevelopment'), progress: '90', width: 'w-[90%]' },
    { title: t('webDesign'), progress: '70', width: 'w-[70%]' },
    { title: t('branding'), progress: '50', width: 'w-[50%]' },
    { title: 'Wordpress', progress: '90', width: 'w-[90%]' },
  ];
  return { education, experience, skills };
};

export default useResume;
