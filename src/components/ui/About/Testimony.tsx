/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { CardType, ModalType } from '../../../types';
import { Card } from '../Card';
import Section from '../Section';

interface testimonyProps {
  data: CardType[];
  handleTestimonyData?: (info: ModalType) => void;
}

const Testimony = ({ data, handleTestimonyData }: testimonyProps) => {
  return (
    <Section name="testimonials" title="Testimonials" className="testimonials">
      <Card type="testimony" cards={data} handleModalInfo={handleTestimonyData} />
    </Section>
  );
};

export default Testimony;
