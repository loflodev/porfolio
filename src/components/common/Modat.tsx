/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

import type { modalInfoType } from '../../pages/About';

interface ModalProps {
  modalInfo: modalInfoType;
  active: boolean;
  handleClick: () => void;
}

const Modal = ({ active, handleClick, modalInfo }: ModalProps) => {
  const showModal = active ? 'active' : '';

  return (
    modalInfo && (
      <div className={`modal-container ${showModal}`} data-modal-container>
        <div className={`overlay ${showModal}`}></div>

        <section className="testimonials-modal">
          <button className="modal-close-btn" onClick={handleClick}>
            <IonIcon icon={closeOutline} />
          </button>

          <div className="modal-img-wrapper">
            <figure className="modal-avatar-box">
              <img src={modalInfo.image} alt="Daniel lewis" width="80" data-modal-img />
            </figure>

            <img src="/src/assets/image/icon-quote.svg" alt="quote icon" />
          </div>

          <div className="modal-content">
            <h4 className="h3 modal-title" data-modal-title>
              {modalInfo.title}
            </h4>

            <time dateTime={modalInfo.date}>{modalInfo.date}</time>

            <div data-modal-text>
              <p>{modalInfo.description}</p>
            </div>
          </div>
        </section>
      </div>
    )
  );
};

export default Modal;
