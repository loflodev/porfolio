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
