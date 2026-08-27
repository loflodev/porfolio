import usePricing from './usePricing';
import Article from '../../components/ui/Article';
import Modal from '../../components/ui/Modal';
import PricingCard from '../../components/ui/Pricing/PricingCard';
import Section from '../../components/ui/Section';
import useTranslation from '../../hooks/useTransalation';

const Pricing = () => {
  const { t } = useTranslation();
  const { plans, showModal, toggleModal, modalData, handlePlanSelect } = usePricing();

  return (
    <Article className="pricing" name="article" header={t('pricing')}>
      <Section className="plans">
        <PricingCard data={plans} onSelect={handlePlanSelect} />
      </Section>

      <Modal
        showModal={showModal}
        handleModal={toggleModal}
        data={modalData}
        notification="message"
      />
    </Article>
  );
};

export default Pricing;
