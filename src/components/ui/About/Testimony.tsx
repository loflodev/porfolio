import useTranslation from '../../../hooks/useTransalation';
import type { CardType, ModalType } from '../../../types';
import { Card } from '../Card';
import Section from '../Section';

type TestimonyProps = {
  data: CardType[];
  handleTestimonyData?: (info: ModalType) => void;
};

const Testimony = ({ data, handleTestimonyData }: TestimonyProps) => {
  const { t } = useTranslation();

  return (
    <Section name="testimonials" title={t('testimonials')} className="testimonials">
      <Card type="testimony" cards={data} handleModalInfo={handleTestimonyData} />
    </Section>
  );
};

export default Testimony;
