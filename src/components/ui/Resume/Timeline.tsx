/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { bookOutline } from 'ionicons/icons';

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
          <IonIcon icon={bookOutline} />
        </div>

        <h3 className="h3">{name}</h3>
      </div>

      <ol className="timeline-list">
        {data.map((item, index) => (
          <li key={`timeline-${index}`} className="timeline-item">
            <h4 className="h4 timeline-item-title">{item.title}</h4>

            <span>{item.time}</span>

            <p className="timeline-text">{item.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
};

export default Timeline;
