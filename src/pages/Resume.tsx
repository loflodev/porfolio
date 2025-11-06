import Article from '../components/ui/Article';
import Skills from '../components/ui/Resume/Skills';
import Timeline from '../components/ui/Resume/Timeline';
import { EDUCATION, EXPERIRENCE, SKILLS } from '../constants';

const Resume = () => {
  return (
    <Article className="resume" name="article" header="resume">
      <Timeline name="Education" data={EDUCATION} />
      <Timeline name="Experience" data={EXPERIRENCE} />
      <Skills name="My Skills" data={SKILLS} />
    </Article>
  );
};

export default Resume;
