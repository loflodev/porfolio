export type TopMenuType = {
  label: string;
  to: string;
  index: boolean;
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

export type PortfolioType = {
  title: string;
  category: string;
  image: string;
  alt: string;
  to: string;
};

export type TabType = {
  title: string;
  index: boolean;
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
export type ErrorType =
  | 'Invalid email'
  | 'Email is required'
  | 'Email cannot be empty'
  | 'Cannot be empty'
  | 'Input require at least 3 character';

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

type ErrorMessageType = Record<'fullName' | 'email' | 'yourMessage', ErrorType | ''>;

export type ContactFormInputType = {
  fullName: string;
  email: string;
  yourMessage: string;
  errorMessage: ErrorMessageType;
};
