/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';

import type { TabType } from '../../../types';

interface TabProps {
  data: TabType[];
  handleSelect: (index: number) => void;
  activeTab: number;
}
const Tab = ({ data, handleSelect, activeTab }: TabProps) => {
  return (
    <>
      <ul className="filter-list">
        {data.map((item, index) => (
          <li className="filter-item">
            <button
              className={`${activeTab === index ? 'active' : ''} capitalize`}
              onClick={() => handleSelect(index)}
              data-filter-btn
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>

      <div className="filter-select-box">
        <button className="filter-select" data-select>
          <div className="select-value" data-selecct-value>
            Select category
          </div>

          <div className="select-icon">
            <IonIcon icon={chevronDown} />
          </div>
        </button>

        <ul className="select-list">
          <li className="select-item">
            <button data-select-item>All</button>
          </li>

          <li className="select-item">
            <button data-select-item>Web design</button>
          </li>

          <li className="select-item">
            <button data-select-item>Applications</button>
          </li>

          <li className="select-item">
            <button data-select-item>Web development</button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Tab;
