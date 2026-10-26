/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IoBookOutline } from 'react-icons/io5';

import type { TimelineType } from '../../../types';
import Section from '../Section';

interface TimelineProps {
  name: string;
  data: TimelineType[];
}

const Timeline = ({ name, data }: TimelineProps) => {
  return (
    <Section className="timeline">
      <div className="title-wrapper">
        <div className="icon-box">
          <IoBookOutline aria-hidden="true" />
        </div>

        <h2 className="h3">{name}</h2>
      </div>

      <ol className="timeline-list">
        {data.map((item, index) => (
          <li key={`timeline-${index}`} className="timeline-item">
            <h3 className="h4 timeline-item-title">{item.title}</h3>

            <span>{item.time}</span>

            <p className="timeline-text">{item.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
};

export default Timeline;
