/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { SkillType } from '../../../types';
import Section from '../Section';

interface SkillsProps {
  name: string;
  data: SkillType[];
}

const Skills = ({ name, data }: SkillsProps) => {
  return (
    <Section className="skill">
      <h3 className="h3 skills-title">{name}</h3>

      <ul className="skills-list content-card">
        {data.map((item, index) => (
          <li key={`skils-${index}`} className="skills-item">
            <div className="title-wrapper">
              <h5 className="h5">{item.title}</h5>
              <data value={item.progress}>{`${item.progress}%`}</data>
            </div>

            <div className="skill-progress-bg">
              <div className={`skill-progress-fill ${item.width}`}></div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
};

export default Skills;
