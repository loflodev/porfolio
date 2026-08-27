import useMainContext from '../../hooks/useMainContext';
import useTranslation from '../../hooks/useTransalation';
import type { ModalType, PricingPlanType } from '../../types';

const buildPricingPlans = (): PricingPlanType[] => [
  {
    title: 'pricingPage.plans.essentialTitle',
    price: 'pricingPage.plans.essentialPrice',
    description: 'pricingPage.plans.essentialDescription',
    features: [
      'pricingPage.plans.essentialFeature1',
      'pricingPage.plans.essentialFeature2',
      'pricingPage.plans.essentialFeature3',
      'pricingPage.plans.essentialFeature4',
      'pricingPage.plans.essentialFeature5',
      'pricingPage.plans.essentialFeature6',
    ],
    ctaLabel: 'pricingPage.plans.essentialCta',
    ctaType: 'modal',
  },
  {
    title: 'pricingPage.plans.growthTitle',
    price: 'pricingPage.plans.growthPrice',
    description: 'pricingPage.plans.growthDescription',
    features: [
      'pricingPage.plans.growthFeature1',
      'pricingPage.plans.growthFeature2',
      'pricingPage.plans.growthFeature3',
      'pricingPage.plans.growthFeature4',
      'pricingPage.plans.growthFeature5',
      'pricingPage.plans.growthFeature6',
    ],
    ctaLabel: 'pricingPage.plans.growthCta',
    ctaType: 'modal',
    isFeatured: true,
  },
  {
    title: 'pricingPage.plans.enterpriseTitle',
    price: 'pricingPage.plans.enterprisePrice',
    description: 'pricingPage.plans.enterpriseDescription',
    features: [
      'pricingPage.plans.enterpriseFeature1',
      'pricingPage.plans.enterpriseFeature2',
      'pricingPage.plans.enterpriseFeature3',
      'pricingPage.plans.enterpriseFeature4',
      'pricingPage.plans.enterpriseFeature5',
      'pricingPage.plans.enterpriseFeature6',
    ],
    ctaLabel: 'pricingPage.plans.enterpriseCta',
    ctaType: 'link',
    ctaTo: '/contact',
  },
];

const usePricing = () => {
  const { t } = useTranslation();
  const { showModal, toggleModal, modalData, handleModalData } = useMainContext();

  const plans = buildPricingPlans();

  const handlePlanSelect = (plan: PricingPlanType) => {
    if (plan.ctaType === 'modal') {
      const comingSoonModalData: ModalType = {
        title: t('pricingPage.comingSoonTitle'),
        description: t('pricingPage.comingSoonDescription'),
        icon: '',
      };
      handleModalData(comingSoonModalData);
    }
  };

  return { plans, showModal, toggleModal, modalData, handlePlanSelect };
};

export default usePricing;
