import { Link } from 'react-router-dom';

import useTranslation from '../../../hooks/useTransalation';
import type { ClientSectionType } from '../../../types';
import Section from '../Section';

type ClientProps = {
  clients: ClientSectionType[];
};

const CLIENT_LOGO_WIDTH = 209;
const CLIENT_LOGO_HEIGHT = 131;

const Client = ({ clients }: ClientProps) => {
  const { t } = useTranslation();

  return (
    <Section name={'clients'} title={t('clients')} className="clients">
      <ul className="clients-list has-scrollbar">
        {clients.map((item, index) => {
          const logo = (
            <img
              src={item.image}
              alt={item.alt}
              width={CLIENT_LOGO_WIDTH}
              height={CLIENT_LOGO_HEIGHT}
              loading="lazy"
            />
          );

          return (
            <li key={`client-${index}`} className="clients-item">
              {/* Clients without a site to link to render as a plain logo, not a dead link. */}
              {item.to === '#' ? logo : <Link to={item.to}>{logo}</Link>}
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

export default Client;
