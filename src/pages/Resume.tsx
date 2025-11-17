import Article from '../components/ui/Article';
import Skills from '../components/ui/Resume/Skills';
import Timeline from '../components/ui/Resume/Timeline';
import { EDUCATION, EXPERIRENCE, SKILLS } from '../constants';
import useTranslation from '../hooks/useTransalation';

const Resume = () => {
  const { t } = useTranslation();
  return (
    <Article className="resume" name="article" header={t('resume')}>
      <Timeline name={t('education')} data={EDUCATION} />
      <Timeline name={t('experience')} data={EXPERIRENCE} />
      <Skills name={t('mySkills')} data={SKILLS} />
    </Article>
  );
};

export default Resume;
