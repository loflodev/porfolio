import usePricing from './usePricing';
import Seo from '../../components/common/Seo';
import Article from '../../components/ui/Article';
import Modal from '../../components/ui/Modal';
import PricingCard from '../../components/ui/Pricing/PricingCard';
import Section from '../../components/ui/Section';
import useTranslation from '../../hooks/useTransalation';

const Pricing = () => {
  const { t } = useTranslation();
  const { plans, showModal, toggleModal, modalData, handlePlanSelect, isRedirecting } =
    usePricing();

  return (
    <Article className="pricing" name="article" header={t('pricing')}>
      <Seo
        title="Pricing"
        description="Service plans and pricing for full stack web development work with Louis Florival."
        path="/pricing"
      />
      <Section className="plans">
        <PricingCard data={plans} onSelect={handlePlanSelect} isRedirecting={isRedirecting} />
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
