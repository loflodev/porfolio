/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { CardType, ModalType } from '../../types';

interface CardProps {
  cards: CardType[];
  type?: 'service' | 'testimony';
  handleModalInfo?: (info: ModalType) => void;
}

interface ServiceCardProps {
  cards: CardType[];
}

interface TestimonyCardProps {
  cards: CardType[];
  handleModalInfo?: (info: ModalType) => void;
}

export const Card = ({ cards, type, handleModalInfo }: CardProps) => {
  switch (type) {
    case 'service':
      return <ServiceCard cards={cards} />;
    case 'testimony':
      return <TestimonyCard cards={cards} handleModalInfo={handleModalInfo} />;
    default:
      return <>ando ala mierda</>;
  }
};

export const ServiceCard = ({ cards }: ServiceCardProps) => {
  return (
    <ul className="service-list">
      {cards.map((item, index) => (
        <li key={`card -${index}`} className="service-item">
          <div className="service-icon-box">
            <img src={item.image} alt={item.alt} width="40" />
          </div>

          <div className="service-content-box">
            <h4 className="h4 service-item-title">{item.title}</h4>

            <p className="service-item-text">{item.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const TestimonyCard = ({ cards, handleModalInfo }: TestimonyCardProps) => {
  return (
    handleModalInfo && (
      <ul className="testimonials-list has-scrollbar">
        {cards.map((item, index) => (
          <li
            key={`testimony-${index}`}
            className="testimonials-item"
            onClick={() =>
              handleModalInfo({
                icon: item.image,
                title: item.title,
                date: item.date,
                description: item.description,
              })
            }
          >
            <div className="content-card" data-testimonials-item>
              <figure className="testimonials-avatar-box">
                <img src={item.image} alt={item.alt} width="60" data-testimonials-avatar />
              </figure>

              <h4 className="h4 testimonials-item-title" data-testimonials-title>
                {item.title}
              </h4>

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
