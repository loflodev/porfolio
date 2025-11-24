/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { documentOutline } from 'ionicons/icons';

interface EmptyListProps {
  title: string;
}

const EmptyList = ({ title }: EmptyListProps) => {
  return (
    <div className="empty-list">
      <p>{title}</p>
      <IonIcon className="socials-icons" icon={documentOutline} size="large" />
    </div>
  );
};

export default EmptyList;
