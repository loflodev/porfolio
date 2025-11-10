/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { useState, type ReactNode } from 'react';

import { MainContext } from './MainContext';
import type { ModalType } from '../types';

interface MainProviderProps {
  children: ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<ModalType>({
    title: '',
    description: '',
    icon: '',
  });

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  const handleModalData = (data: ModalType) => {
    setModalData(data);
    toggleModal();
  };

  const value = {
    showModal,
    toggleModal,
    modalData,
    handleModalData,
  };
  return <MainContext.Provider value={value}>{children}</MainContext.Provider>;
};

export default MainProvider;
