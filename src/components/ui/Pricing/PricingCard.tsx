/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';
import type { PricingPlanType } from '../../../types';

interface PricingCardProps {
  data: PricingPlanType[];
  onSelect: (plan: PricingPlanType) => void;
  isRedirecting: boolean;
}

const PricingCard = ({ data, onSelect, isRedirecting }: PricingCardProps) => {
  const { t } = useTranslation();

  return (
    <ul className="pricing-list">
      {data.map((plan, index) => (
        <li key={`plan-${index}`} className={`pricing-item ${plan.isFeatured ? 'featured' : ''}`}>
          {plan.isFeatured && (
            <span className="pricing-badge">{t('pricingPage.plans.mostPopular')}</span>
          )}

          <h4 className="h4 pricing-item-title">{t(plan.title)}</h4>

          <p className="pricing-item-price">{t(plan.price)}</p>

          <p className="pricing-item-text">{t(plan.description)}</p>

          <ul className="pricing-feature-list">
            {plan.features.map((feature, featureIndex) => (
              <li key={`feature-${index}-${featureIndex}`} className="pricing-feature-item">
                <IonIcon icon={checkmarkOutline} />
                <span>{t(feature)}</span>
              </li>
            ))}
          </ul>

          {plan.ctaType === 'link' ? (
            <Link className="pricing-btn form-btn" to={plan.ctaTo ?? '/contact'}>
              <span>{t(plan.ctaLabel)}</span>
            </Link>
          ) : (
            <button
              className="pricing-btn form-btn"
              type="button"
              onClick={() => onSelect(plan)}
              disabled={isRedirecting}
            >
              <span>{t(plan.ctaLabel)}</span>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default PricingCard;
