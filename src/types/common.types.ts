import type { ContactSubject, PlanSlug } from '../constants/app.constants';

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

export type GalleryImageType = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type PortfolioType = {
  slug: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  linkTo1: string;
  linkTo2: string;
  /** One or two sentences shown on the card's hover panel. */
  summary: string;
  /** Detail page paragraphs. */
  description: string[];
  stacks: string[];
  gallery: GalleryImageType[];
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
  | 'errors.slotTaken'
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

type ErrorMessageType = Record<
  'fullName' | 'email' | 'yourMessage' | 'consultationDate' | 'consultationTime',
  ErrorType | string
>;

export type ContactFormInputType = {
  fullName: string;
  email: string;
  subject: ContactSubject;
  yourMessage: string;
  /** Consultation only: Montreal-local YYYY-MM-DD and HH:MM. */
  consultationDate: string;
  consultationTime: string;
  website: string; // Honeypot field - should always be empty
  errorMessage: ErrorMessageType;
};
