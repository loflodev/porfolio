import type { IconType } from 'react-icons';
import { IoCodeSlashOutline, IoEyeOutline } from 'react-icons/io5';

import useTranslation from '../../hooks/useTransalation';

type ThumbnailIconProps = {
  project: string;
  link1: string;
  link2: string;
};

type ProjectLinkIconProps = {
  link: string;
  label: string;
  Icon: IconType;
};

const NO_LINK = '#';

const ProjectLinkIcon = ({ link, label, Icon }: ProjectLinkIconProps) =>
  link === NO_LINK ? null : (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <Icon aria-hidden="true" />
    </a>
  );

const ThumbnailIcon = ({ project, link1, link2 }: ThumbnailIconProps) => {
  const { t } = useTranslation();
  const hasLiveSite = link1 !== NO_LINK;
  const hasSourceCode = link2 !== NO_LINK;

  if (!hasLiveSite && !hasSourceCode) {
    return null;
  }

  return (
    <div className="project-item-icon-box">
      <ProjectLinkIcon link={link1} label={t('viewLiveSite', { project })} Icon={IoEyeOutline} />

      {hasLiveSite && hasSourceCode && <div className="vertical-line" />}

      <ProjectLinkIcon
        link={link2}
        label={t('viewSourceCode', { project })}
        Icon={IoCodeSlashOutline}
      />
    </div>
  );
};

export default ThumbnailIcon;
