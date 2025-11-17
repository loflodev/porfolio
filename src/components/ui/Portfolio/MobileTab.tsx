import { IonIcon } from '@ionic/react';
import { chevronDown } from 'ionicons/icons';
import { useState } from 'react';

import type { TabType } from '../../../types';

type MobileTabProps = {
  data: TabType[];
  handleSelect: (index: number) => void;
  activeTab: number;
};

const MobileTab = ({ data, handleSelect, activeTab }: MobileTabProps) => {
  const [showDropdown, setShowDropDown] = useState(false);

  const toggleDropDown = () => {
    setShowDropDown((prev) => !prev);
  };
  return (
    <div className="filter-select-box">
      <button className={`filter-select ${showDropdown ? 'active' : ''}`} onClick={toggleDropDown}>
        <div className="select-value capitalize" data-selecct-value>
          {data[activeTab].isSelected ? data[activeTab].title : 'Select category'}
        </div>

        <div className="select-icon">
          <IonIcon icon={chevronDown} />
        </div>
      </button>

      <ul className="select-list">
        {data.map((item, index) => (
          <li key={`mobile-tab-${index}`} className="select-item">
            <button
              className={`${activeTab === index ? 'active' : ''} capitalize`}
              onClick={() => {
                handleSelect(index);
                toggleDropDown();
              }}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MobileTab;
