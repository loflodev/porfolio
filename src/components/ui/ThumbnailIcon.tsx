/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { codeSlashOutline, eyeOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';

interface ThumbnailIconProps {
  link1: string;
  link2: string;
}

const ThumbnailIcon = ({ link1, link2 }: ThumbnailIconProps) => {
  const showIconBox = link1 !== '#' || link2 !== '#';
  const showSeperationLine = link1 !== '#' && link2 !== '#';

  const showFirstIcon = link1 !== '#';
  const showSecondtIcon = link2 !== '#';

  return (
    showIconBox && (
      <div className="project-item-icon-box">
        {showFirstIcon && (
          <Link to={link1}>
            <IonIcon icon={eyeOutline} />
          </Link>
        )}

        {showSeperationLine && <div className="vertical-line" />}

        {showSecondtIcon && (
          <Link to={link2}>
            <IonIcon icon={codeSlashOutline} />
          </Link>
        )}
      </div>
    )
  );
};

export default ThumbnailIcon;
