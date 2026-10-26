/* eslint-disable @typescript-eslint/consistent-type-definitions */

import ThumbnailIcon from './ThumbnailIcon';
import { DEFAULT_STATE_NUMBER } from '../../constants';
import type { PortfolioType } from '../../types';

// Intrinsic size of the resized project screenshots; lets the browser reserve space before load.
const PROJECT_IMAGE_WIDTH = 1024;
const PROJECT_IMAGE_HEIGHT = 768;

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
              <ThumbnailIcon project={item.title} link1={item.linkTo1} link2={item.linkTo2} />
              <img
                src={item.image}
                alt={item.alt}
                width={PROJECT_IMAGE_WIDTH}
                height={PROJECT_IMAGE_HEIGHT}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <h2 className="project-title">{item.title}</h2>

            <p className="project-category">{item.category}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ThumbnailCard;
