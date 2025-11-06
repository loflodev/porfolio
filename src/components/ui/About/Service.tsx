import { SERVICES } from '../../../constants';
import { Card } from '../Card';
import Section from '../Section';

const Service = () => {
  return (
    <Section name={'service'} title={"What i'm doing"} className="service">
      <Card type="service" cards={SERVICES} />
    </Section>
  );
};

export default Service;
