import { useEffect, useRef } from 'react';
import { IoChevronBack, IoChevronForward, IoCloseOutline } from 'react-icons/io5';

import useTranslation from '../../../hooks/useTransalation';
import type { GalleryImageType } from '../../../types';

type LightboxProps = {
  images: GalleryImageType[];
  /** Index of the open image, or null when the lightbox is closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

const NEXT = 1;
const PREVIOUS = -1;

// Native modal <dialog>, like Modal.tsx: focus trapping, Escape-to-close and focus return to
// the gallery button come for free; `index` stays the source of truth and the dialog follows it.
const Lightbox = ({ images, index, onClose, onNavigate }: LightboxProps) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = index !== null;
  const total = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const step = (offset: number) => {
    if (index === null) return;
    onNavigate((index + offset + total) % total);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') step(NEXT);
    if (e.key === 'ArrowLeft') step(PREVIOUS);
  };

  // Clicks on the dialog itself (not the image or controls) are backdrop clicks.
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains('lightbox-stage')
    ) {
      onClose();
    }
  };

  const image = index === null ? null : images[index];

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- keyboard paging and backdrop clicks on the dialog
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={t('gallery')}
      onClose={() => isOpen && onClose()}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {image && index !== null && (
        <>
          <button
            type="button"
            className="lightbox-btn lightbox-close"
            onClick={onClose}
            aria-label={t('closeImage')}
          >
            <IoCloseOutline aria-hidden="true" />
          </button>

          <div className="lightbox-stage">
            <img
              className="lightbox-img"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
            />
          </div>

          {total > NEXT && (
            <>
              <button
                type="button"
                className="lightbox-btn lightbox-prev"
                onClick={() => step(PREVIOUS)}
                aria-label={t('previousImage')}
              >
                <IoChevronBack aria-hidden="true" />
              </button>
              <button
                type="button"
                className="lightbox-btn lightbox-next"
                onClick={() => step(NEXT)}
                aria-label={t('nextImage')}
              >
                <IoChevronForward aria-hidden="true" />
              </button>
            </>
          )}

          <p className="lightbox-counter" aria-live="polite">
            {index + NEXT} / {total}
          </p>
        </>
      )}
    </dialog>
  );
};

export default Lightbox;
