import type { PlanSlug } from '../constants/app.constants';

export type TopMenuType = {
  label: string;
  to: string;
};

export type CardType = {
  title: string;
  image: string;
  alt: string;
  description: string;
  date?: string;
};

export type ClientSectionType = {
  to: string;
  image: string;
  alt: string;
};

export type TimelineType = {
  title: string;
  time: string;
  description: string;
};

export type SkillType = {
  title: string;
  progress: string;
  width: string;
};

export type PricingPlanType = {
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaType: 'link' | 'checkout';
  ctaTo?: string;
  planSlug?: PlanSlug;
  isFeatured?: boolean;
};

export type PortfolioType = {
  title: string;
  category: string;
  image: string;
  alt: string;
  linkTo1: string;
  linkTo2: string;
};

export type TabType = {
  title: string;
  isSelected: boolean;
};

export type PostType = {
  to: string;
  image: string;
  alt: string;
  meta: PostMetaType;
  title: string;
  description: string;
};

export type PostMetaType = {
  category: string;
  date: string;
};
// i18n keys under `errors` in the locale files; rendered with t() by the form.
export type ErrorType =
  | 'errors.required'
  | 'errors.invalidEmail'
  | 'errors.minLength'
  | 'errors.submitFailed'
  | 'errors.network'
  | 'errors.unexpected';

export type ValidationType = {
  isValid: boolean;
  input: string;
  message: ErrorType | '';
};

export type ModalType = {
  title: string;
  description: string;
  icon: string;
  date?: string;
};

type ErrorMessageType = Record<'fullName' | 'email' | 'yourMessage', ErrorType | string>;

export type ContactFormInputType = {
  fullName: string;
  email: string;
  yourMessage: string;
  website: string; // Honeypot field - should always be empty
  errorMessage: ErrorMessageType;
};
