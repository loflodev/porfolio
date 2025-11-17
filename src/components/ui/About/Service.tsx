/* eslint-disable @typescript-eslint/consistent-type-definitions */
import useTranslation from '../../../hooks/useTransalation';
import type { CardType } from '../../../types';
import { Card } from '../Card';
import Section from '../Section';

interface ServicesProps {
  data: CardType[];
}

const Service = ({ data }: ServicesProps) => {
  const { t } = useTranslation();
  return (
    <Section name={'service'} title={t('about.services.whatImDoing')} className="service">
      <Card type="service" cards={data} />
    </Section>
  );
};

export default Service;
