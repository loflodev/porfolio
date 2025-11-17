/* eslint-disable @typescript-eslint/consistent-type-definitions */

import MobileTab from './MobileTab';
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
          <li key={`tab-${index}`} className="filter-item">
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

      <MobileTab data={data} handleSelect={handleSelect} activeTab={activeTab} />
    </>
  );
};

export default Tab;
