import { useState } from 'react';

import type { CardType } from '../../types';

const useAbout = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<CardType>({
    alt: '',
    title: '',
    date: '',
    description: '',
    image: '#',
  });

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  const handleModalData = (info: CardType) => {
    setModalData(info);
    toggleModal();
  };
  return { showModal, modalData, toggleModal, handleModalData };
};

export default useAbout;
