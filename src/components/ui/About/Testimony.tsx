/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { TESTIMONIES } from '../../../constants';
import type { CardType } from '../../../types';
import { Card } from '../Card';
import Section from '../Section';

interface testimonyProps {
  handleTestimonyData?: (info: CardType) => void;
}

const Testimony = ({ handleTestimonyData }: testimonyProps) => {
  return (
    <Section name="testimonials" title="Testimonials" className="testimonials">
      <Card type="testimony" cards={TESTIMONIES} handleModalInfo={handleTestimonyData} />
    </Section>
  );
};

export default Testimony;
