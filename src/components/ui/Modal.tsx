import { useEffect, useId, useRef } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

import iconQuote from '@/assets/images/icon-quote.svg';

import useTranslation from '../../hooks/useTransalation';
import type { ModalType } from '../../types';

type ModalProps = {
  data: ModalType;
  showModal: boolean;
  handleModal: () => void;
  notification?: 'message' | 'popup';
};

// A native modal <dialog> gives focus trapping, Escape-to-close and focus return to the
// trigger for free; `showModal` stays the source of truth and the dialog follows it.
const Modal = ({ showModal, handleModal, data, notification = 'popup' }: ModalProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showModal && !dialog.open) {
      dialog.showModal();
    } else if (!showModal && dialog.open) {
      dialog.close();
    }
  }, [showModal]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === overlayRef.current || e.target === dialog) {
        dialog.close();
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, []);

  // Fires for Escape, backdrop clicks and programmatic closes; only sync state when the
  // dialog closed on its own (Escape/backdrop) while state still says open.
  const handleClose = () => {
    if (showModal) {
      handleModal();
    }
  };

  const isActive = showModal ? 'active' : '';

  return (
    <dialog
      ref={dialogRef}
      className={`modal-container ${isActive}`}
      aria-labelledby={titleId}
      onClose={handleClose}
      data-modal-container
    >
      <div ref={overlayRef} className={`overlay ${isActive}`}></div>

      <section className="testimonials-modal">
        <button
          type="button"
          className="modal-close-btn"
          onClick={handleModal}
          aria-label={t('close')}
        >
          <IoCloseOutline aria-hidden="true" />
        </button>

        <div className="modal-img-wrapper">
          {notification === 'popup' && data.icon && (
            <figure className="modal-avatar-box">
              <img src={data.icon} alt={data.title} width="80" data-modal-img />
            </figure>
          )}

          <img src={iconQuote} alt="" />
        </div>

        <div className="modal-content">
          <h2 id={titleId} className="h3 modal-title" data-modal-title>
            {data.title}
          </h2>

          <div data-modal-text>
            <p>{data.description}</p>
          </div>
        </div>
      </section>
    </dialog>
  );
};

export default Modal;
