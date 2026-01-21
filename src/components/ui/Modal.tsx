/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

import type { ModalType } from '../../types';

interface ModalProps {
  data: ModalType;
  showModal: boolean;
  handleModal: () => void;
  notification?: 'message' | 'popup';
}

const Modal = ({ showModal, handleModal, data, notification = 'popup' }: ModalProps) => {
  const isActive = showModal ? 'active' : '';
  return (
    data && (
      <div className={`modal-container ${isActive}`} data-modal-container>
        <div className={`overlay ${isActive}`}></div>

        <section className="testimonials-modal">
          <button className="modal-close-btn" onClick={handleModal}>
            <IonIcon icon={closeOutline} />
          </button>

          <div className="modal-img-wrapper">
            {notification === 'popup' && (
              <figure className="modal-avatar-box">
                <img src={data.icon} alt="Daniel lewis" width="80" data-modal-img />
              </figure>
            )}

            <img src="/src/assets/images/icon-quote.svg" alt="quote icon" />
          </div>

          <div className="modal-content">
            <h4 className="h3 modal-title" data-modal-title>
              {data.title}
            </h4>

            {/* <time dateTime={data.date}>{data.date}</time> */}

            <div data-modal-text>
              <p>{data.description}</p>
            </div>
          </div>
        </section>
      </div>
    )
  );
};

export default Modal;
