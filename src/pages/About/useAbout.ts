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
      alt: t('about.services.webDesign'),
      title: t('about.services.webDesign'),
      image: '/src/assets/images/icon-design.svg',
      description: t('about.services.webDesignDescription'),
    },
    {
      alt: t('about.services.webDevelopment'),
      title: t('about.services.webDevelopment'),
      image: '/src/assets/images/icon-dev.svg',
      description: t('about.services.webDevelopmentDescription'),
    },
    {
      alt: t('about.services.mobileApps'),
      title: t('about.services.mobileApps'),
      image: '/src/assets/images/icon-app.svg',
      description: t('about.services.mobileAppsDescription'),
    },
    {
      alt: t('about.services.seo'),
      title: t('about.services.seo'),
      image: '/src/assets/images/icon-seo.svg',
      description: t('about.services.seoDescription'),
    },
  ];

  const testimonies: CardType[] = [
    {
      alt: 'Daniel lewis',
      title: 'Daniel lewis',
      image: '/src/assets/images/avatar-1.png',
      description: t('about.testimonials.feedback1'),
    },
    {
      alt: 'Jessica miller',
      title: 'Jessica miller',
      image: '/src/assets/images/avatar-2.png',
      description: t('about.testimonials.feedback2'),
    },
    {
      alt: 'Emily evans',
      title: 'Emily evans',
      image: '/src/assets/images/avatar-3.png',
      description: t('about.testimonials.feedback3'),
    },
    {
      alt: 'Henry william"',
      title: 'Henry william',
      image: '/src/assets/images/avatar-4.png',
      description: t('about.testimonials.feedback4'),
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
