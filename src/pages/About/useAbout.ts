import { useState } from 'react';

import avatar1 from '@/assets/images/avatar-1.png';
import avatar2 from '@/assets/images/avatar-2.png';
import avatar3 from '@/assets/images/avatar-3.png';
import avatar4 from '@/assets/images/avatar-4.png';
import iconApp from '@/assets/images/icon-app.svg';
import iconDesign from '@/assets/images/icon-design.svg';
import iconDev from '@/assets/images/icon-dev.svg';
import iconSeo from '@/assets/images/icon-seo.svg';

import useTranslation from '../../hooks/useTransalation';
import type { CardType } from '../../types';

const useAbout = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<CardType>({
    alt: '',
    title: '',
    date: '',
    description: '',
    image: '#',
  });

  const services: CardType[] = [
    {
      alt: t('webDesign'),
      title: t('webDesign'),
      image: iconDesign,
      description: t('aboutPage.services.description1'),
    },
    {
      alt: t('webDevelopment'),
      title: t('webDevelopment'),
      image: iconDev,
      description: t('aboutPage.services.description2'),
    },
    {
      alt: t('mobileApps'),
      title: t('mobileApps'),
      image: iconApp,
      description: t('aboutPage.services.description3'),
    },
    {
      alt: t('seo'),
      title: t('seo'),
      image: iconSeo,
      description: t('aboutPage.services.description4'),
    },
  ];

  const testimonies: CardType[] = [
    {
      alt: 'Guise S',
      title: 'Guise S',
      image: avatar1,
      description: t('aboutPage.testimonials.feedback1'),
    },
    {
      alt: 'Wilson Jean',
      title: 'Wilson Jean',
      image: avatar4,
      description: t('aboutPage.testimonials.feedback2'),
    },
    {
      alt: 'Team Bouskad',
      title: 'Team Bouskad',
      image: avatar3,
      description: t('aboutPage.testimonials.feedback3'),
    },
    {
      alt: 'JD Pet',
      title: 'JD Pet',
      image: avatar2,
      description: t('aboutPage.testimonials.feedback4'),
    },
  ];

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  const handleModalData = (info: CardType) => {
    setModalData(info);
    toggleModal();
  };
  return { services, testimonies, showModal, modalData, toggleModal, handleModalData };
};

export default useAbout;
