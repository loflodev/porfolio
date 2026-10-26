import { useCallback, useRef, useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import useEscapeKey from '../../../hooks/useEscapeKey';
import useTranslation from '../../../hooks/useTransalation';
import type { TabType } from '../../../types';

type MobileTabProps = {
  data: TabType[];
  handleSelect: (index: number) => void;
  activeTab: number;
};

const SELECT_LIST_ID = 'portfolio-category-list';

const MobileTab = ({ data, handleSelect, activeTab }: MobileTabProps) => {
  const { t } = useTranslation();
  const [showDropdown, setShowDropDown] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const toggleDropDown = () => {
    setShowDropDown((prev) => !prev);
  };

  const closeAndRefocus = useCallback(() => {
    setShowDropDown(false);
    toggleRef.current?.focus();
  }, []);

  useEscapeKey(closeAndRefocus, showDropdown);

  return (
    <div className="filter-select-box">
      <button
        ref={toggleRef}
        type="button"
        className={`filter-select ${showDropdown ? 'active' : ''}`}
        onClick={toggleDropDown}
        aria-expanded={showDropdown}
        aria-controls={SELECT_LIST_ID}
      >
        <div className="select-value capitalize" data-selecct-value>
          {data[activeTab].isSelected ? data[activeTab].title : t('selectCategory')}
        </div>

        <div className="select-icon">
          <IoChevronDown aria-hidden="true" />
        </div>
      </button>

      <ul id={SELECT_LIST_ID} className="select-list">
        {data.map((item, index) => (
          <li key={`mobile-tab-${index}`} className="select-item">
            <button
              type="button"
              className={`${activeTab === index ? 'active' : ''} capitalize`}
              aria-pressed={activeTab === index}
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
