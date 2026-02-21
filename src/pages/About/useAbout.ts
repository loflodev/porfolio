import { useState } from 'react';

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
      image: '/src/assets/images/icon-design.svg',
      description: t('aboutPage.services.description1'),
    },
    {
      alt: t('webDevelopment'),
      title: t('webDevelopment'),
      image: '/src/assets/images/icon-dev.svg',
      description: t('aboutPage.services.description2'),
    },
    {
      alt: t('mobileApps'),
      title: t('mobileApps'),
      image: '/src/assets/images/icon-app.svg',
      description: t('aboutPage.services.description3'),
    },
    {
      alt: t('seo'),
      title: t('seo'),
      image: '/src/assets/images/icon-seo.svg',
      description: t('aboutPage.services.description4'),
    },
  ];

  const testimonies: CardType[] = [
    {
      alt: 'Guise S',
      title: 'Guise S',
      image: '/src/assets/images/avatar-1.png',
      description: t('aboutPage.testimonials.feedback1'),
    },
    {
      alt: 'Wilson Jean',
      title: 'Wilson Jean',
      image: '/src/assets/images/avatar-2.png',
      description: t('aboutPage.testimonials.feedback2'),
    },
    {
      alt: 'Team Bouskad',
      title: 'Team Bouskad',
      image: '/src/assets/images/avatar-3.png',
      description: t('aboutPage.testimonials.feedback3'),
    },
    {
      alt: 'JD Pet"',
      title: 'JD Pet',
      image: '/src/assets/images/avatar-4.png',
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
