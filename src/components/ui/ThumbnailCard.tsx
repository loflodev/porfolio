/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { eyeOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';

import { EMPTY_ARRAY } from '../../constants';
import type { PortfolioType } from '../../types';

interface ThumbnailCardProps {
  data: PortfolioType[];
  category: string;
}

const ThumbnailCard = ({ data, category }: ThumbnailCardProps) => {
  const filterdData = data.filter(
    (item) => item.category.toLocaleLowerCase() === category.toLocaleLowerCase()
  );

  const tabCategory = filterdData.length === EMPTY_ARRAY ? data : filterdData;
  return (
    <ul className="project-list">
      {tabCategory.map((item, index) => (
        <li
          key={`tap-${index}`}
          className="project-item  active"
          data-filter-item
          data-category="web development"
        >
          <Link to={item.to}>
            <figure className="project-img">
              <div className="project-item-icon-box">
                <IonIcon icon={eyeOutline} />
              </div>

              <img src={item.image} alt={item.alt} loading="lazy" />
            </figure>

            <h3 className="project-title">{item.title}</h3>

            <p className="project-category">{item.category}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ThumbnailCard;
