/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { codeSlashOutline, eyeOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';

interface ThumbnailIconProps {
  link1: string;
  link2: string;
}

interface ProjectLinkIconProps {
  show: boolean;
  link: string;
  icon: string;
}

const shouldShowIconBox = (link1: string, link2: string) => link1 !== '#' || link2 !== '#';
const shouldShowSeparator = (link1: string, link2: string) => link1 !== '#' && link2 !== '#';

const ProjectLinkIcon = ({ show, link, icon }: ProjectLinkIconProps) =>
  show ? (
    <Link to={link}>
      <IonIcon icon={icon} />
    </Link>
  ) : null;

const ThumbnailIcon = ({ link1, link2 }: ThumbnailIconProps) => {
  const showFirstIcon = link1 !== '#';
  const showSecondIcon = link2 !== '#';

  return (
    shouldShowIconBox(link1, link2) && (
      <div className="project-item-icon-box">
        <ProjectLinkIcon show={showFirstIcon} link={link1} icon={eyeOutline} />

        {shouldShowSeparator(link1, link2) && <div className="vertical-line" />}

        <ProjectLinkIcon show={showSecondIcon} link={link2} icon={codeSlashOutline} />
      </div>
    )
  );
};

export default ThumbnailIcon;
