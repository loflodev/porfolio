import useTranslation from '../../hooks/useTransalation';
import type { CardType, ModalType } from '../../types';

type CardProps = {
  cards: CardType[];
  type?: 'service' | 'testimony';
  handleModalInfo?: (info: ModalType) => void;
};

type ServiceCardProps = {
  cards: CardType[];
};

type TestimonyCardProps = {
  cards: CardType[];
  handleModalInfo?: (info: ModalType) => void;
};

export const Card = ({ cards, type, handleModalInfo }: CardProps) => {
  switch (type) {
    case 'service':
      return <ServiceCard cards={cards} />;
    case 'testimony':
      return <TestimonyCard cards={cards} handleModalInfo={handleModalInfo} />;
    default:
      return null;
  }
};

const ServiceCard = ({ cards }: ServiceCardProps) => {
  const { t } = useTranslation();
  return (
    <ul className="service-list">
      {cards.map((item, index) => (
        <li key={`card -${index}`} className="service-item">
          <div className="service-icon-box">
            {/* Decorative: the heading next to it already names the service. */}
            <img src={item.image} alt="" width="40" height="40" />
          </div>

          <div className="service-content-box">
            <h3 className="h4 service-item-title">{t(item.title)}</h3>

            <p className="service-item-text">{t(item.description)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const TestimonyCard = ({ cards, handleModalInfo }: TestimonyCardProps) => {
  return (
    handleModalInfo && (
      <ul className="testimonials-list has-scrollbar">
        {cards.map((item, index) => (
          <li key={`testimony-${index}`} className="testimonials-item">
            <div className="content-card" data-testimonials-item>
              <figure className="testimonials-avatar-box">
                <img src={item.image} alt="" width="60" height="59" data-testimonials-avatar />
              </figure>

              <h3 className="h4 testimonials-item-title" data-testimonials-title>
                {/* The button's ::after stretches over the whole card, so the card stays
                    clickable while only valid phrasing content lives inside the button. */}
                <button
                  type="button"
                  className="testimonials-open-btn"
                  onClick={() =>
                    handleModalInfo({
                      icon: item.image,
                      title: item.title,
                      date: item.date,
                      description: item.description,
                    })
                  }
                >
                  {item.title}
                </button>
              </h3>

              <div className="testimonials-text" data-testimonials-text>
                <p>{item.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  );
};
