/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Link } from 'react-router-dom';

import type { ClientSectionType } from '../../../types';
import Section from '../Section';

interface ClientProps {
  clients: ClientSectionType[];
}

const Client = ({ clients }: ClientProps) => {
  return (
    <Section name={'clients'} title="Clients" className="clients">
      <ul className="clients-list has-scrollbar">
        {clients.map((item, index) => (
          <li key={`client-${index}`} className="clients-item">
            <Link to={item.to}>
              <img src={item.image} alt={item.alt} />
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default Client;
