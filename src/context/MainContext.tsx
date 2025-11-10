/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { createContext } from 'react';

import type { ModalType } from '../types';

export interface MainContextType {
  showModal: boolean;
  toggleModal: () => void;
  modalData: ModalType;
  handleModalData: (data: ModalType) => void;
}

export const MainContext = createContext<MainContextType | undefined>(undefined);
