/* eslint-disable @typescript-eslint/consistent-type-definitions */

import ThumbnailIcon from './ThumbnailIcon';
import { DEFAULT_STATE_NUMBER } from '../../constants';
import type { PortfolioType } from '../../types';

interface ThumbnailCardProps {
  data: PortfolioType[];
  category: string;
}

const ThumbnailCard = ({ data, category }: ThumbnailCardProps) => {
  const filterdData = data.filter(
    (item) => item.category.toLocaleLowerCase() === category.toLocaleLowerCase()
  );

  const tabCategory = filterdData.length === DEFAULT_STATE_NUMBER ? data : filterdData;
  return (
    <ul className="project-list">
      {tabCategory.map((item, index) => (
        <li
          key={`tap-${index}`}
          className="project-item  active"
          data-filter-item
          data-category="web development"
        >
          <div className="project-link-a">
            <figure className="project-img">
              <ThumbnailIcon link1={item.linkTo1} link2={item.linkTo2} />
              {/* {(item.linkTo1 !== '#' || item.linkTo2 !== '#') && (
                <div className="project-item-icon-box">
                  {item.linkTo1 !== '#' && (
                    <Link to={item.linkTo1}>
                      <IonIcon icon={eyeOutline} />
                    </Link>
                  )}

                  {item.linkTo1 !== '#' && item.linkTo2 !== '#' && (
                    <div className="vertical-line" />
                  )}

                  {item.linkTo2 !== '#' && (
                    <Link to={item.linkTo2}>
                      <IonIcon icon={codeSlashOutline} />
                    </Link>
                  )}
                </div>
              )} */}
              <img src={item.image} alt={item.alt} loading="eager" decoding="async" />
            </figure>

            <h3 className="project-title">{item.title}</h3>

            <p className="project-category">{item.category}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ThumbnailCard;
