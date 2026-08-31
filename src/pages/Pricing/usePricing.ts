import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import useMainContext from '../../hooks/useMainContext';
import useTranslation from '../../hooks/useTransalation';
import { createCheckoutSession, verifyCheckoutSession } from '../../services/api/checkout';
import type { ModalType, PricingPlanType } from '../../types';
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from '../../utils/checkoutIdempotency';

const SUPPORTED_STRIPE_LOCALES = ['en', 'es', 'fr'];
const LANGUAGE_BASE_INDEX = 0;

// Stripe only needs the base language (e.g. "en"), not region-qualified tags like "en-US" that
// the browser-based language detector can produce; anything unsupported falls back to Stripe
// auto-detecting the locale from the buyer's browser.
const resolveStripeLocale = (language: string): string => {
  const base = language.split('-')[LANGUAGE_BASE_INDEX];

  return SUPPORTED_STRIPE_LOCALES.includes(base) ? base : 'auto';
};

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
    ctaType: 'checkout',
    planSlug: 'essential',
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
    ctaType: 'checkout',
    planSlug: 'growth',
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
  const { t, getCurrentLanguage } = useTranslation();
  const { showModal, toggleModal, modalData, handleModalData } = useMainContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasHandledCheckoutParam = useRef(false);

  const plans = buildPricingPlans();

  const showCheckoutError = () => {
    const errorModalData: ModalType = {
      title: t('pricingPage.checkoutErrorTitle'),
      description: t('pricingPage.checkoutErrorDescription'),
      icon: '',
    };
    handleModalData(errorModalData);
  };

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');

    if (!checkoutStatus || hasHandledCheckoutParam.current) {
      return;
    }
    hasHandledCheckoutParam.current = true;

    const resolveCheckoutOutcome = async () => {
      if (checkoutStatus === 'success') {
        const sessionId = searchParams.get('session_id');
        const verified = sessionId ? await verifyCheckoutSession(sessionId) : false;

        if (verified) {
          handleModalData({
            title: t('pricingPage.checkoutSuccessTitle'),
            description: t('pricingPage.checkoutSuccessDescription'),
            icon: '',
          });
        } else {
          showCheckoutError();
        }
      } else if (checkoutStatus === 'cancelled') {
        handleModalData({
          title: t('pricingPage.checkoutCancelledTitle'),
          description: t('pricingPage.checkoutCancelledDescription'),
          icon: '',
        });
      }
      setSearchParams({}, { replace: true });
    };

    void resolveCheckoutOutcome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handlePlanSelect = async (plan: PricingPlanType) => {
    if (plan.ctaType !== 'checkout' || !plan.planSlug || isRedirecting) {
      return;
    }

    setIsRedirecting(true);
    const idempotencyKey = getOrCreateIdempotencyKey(plan.planSlug);
    const locale = resolveStripeLocale(getCurrentLanguage());
    const result = await createCheckoutSession(plan.planSlug, idempotencyKey, locale);

    if (result.success) {
      clearIdempotencyKey(plan.planSlug);
      window.location.href = result.url;
    } else {
      showCheckoutError();
      setIsRedirecting(false);
    }
  };

  return { plans, showModal, toggleModal, modalData, handlePlanSelect, isRedirecting };
};

export default usePricing;
