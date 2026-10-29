/* eslint-disable @typescript-eslint/consistent-type-definitions */

import { Link } from 'react-router-dom';

import StackBadge from './Portfolio/StackBadge';
import { DEFAULT_STATE_NUMBER } from '../../constants';
import { PROJECT_IMAGE_HEIGHT, PROJECT_IMAGE_WIDTH } from '../../constants/projects';
import { getProjectPath } from '../../constants/projectSlugs';
import type { PortfolioType } from '../../types';

// Badge slots on the hover panel's single row; with more stacks the last slot becomes "+N".
const MAX_CARD_BADGES = 3;
// Touch screens show the stack under the card, where badges can wrap onto a second row.
const MAX_TOUCH_BADGES = 4;
const MORE_BADGE_SLOT = 1;

const StackBadges = ({ stacks, max }: { stacks: string[]; max: number }) => {
  const shownCount = stacks.length > max ? max - MORE_BADGE_SLOT : max;
  const hiddenStacks = stacks.length - shownCount;

  return (
    <>
      {stacks.slice(DEFAULT_STATE_NUMBER, shownCount).map((stack) => (
        <StackBadge key={stack} label={stack} />
      ))}
      {hiddenStacks > DEFAULT_STATE_NUMBER && (
        <StackBadge label={`+${hiddenStacks}`} variant="more" />
      )}
    </>
  );
};

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
      {tabCategory.map((item) => {
        const summaryId = `project-${item.slug}-summary`;

        return (
          <li key={item.slug} className="project-item active" data-filter-item>
            <Link
              to={getProjectPath(item.slug)}
              className="project-link-a"
              aria-describedby={summaryId}
            >
              <figure className="project-img">
                <img
                  src={item.image}
                  alt=""
                  width={PROJECT_IMAGE_WIDTH}
                  height={PROJECT_IMAGE_HEIGHT}
                  loading="lazy"
                  decoding="async"
                />

                {/* Visual preview of the detail page; the summary still reaches screen readers as the
                    link description. */}
                <figcaption className="project-reveal" aria-hidden="true">
                  <p id={summaryId} className="project-reveal-text">
                    {item.summary}
                  </p>
                  <ul className="stack-list">
                    <StackBadges stacks={item.stacks} max={MAX_CARD_BADGES} />
                  </ul>
                </figcaption>
              </figure>

              <div className="project-heading">
                <h2 className="project-title">{item.title}</h2>
                <p className="project-category">{item.category}</p>
              </div>

              {/* Touch screens have no hover panel, so the stack and summary sit under the title.
                  Hidden from screen readers: the summary already is the link description. */}
              <div className="project-touch-info" aria-hidden="true">
                <ul className="stack-list">
                  <StackBadges stacks={item.stacks} max={MAX_TOUCH_BADGES} />
                </ul>
                <p className="project-summary">{item.summary}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ThumbnailCard;
