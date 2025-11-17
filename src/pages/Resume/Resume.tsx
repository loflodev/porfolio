import useResume from './useResume';
import Article from '../../components/ui/Article';
import Skills from '../../components/ui/Resume/Skills';
import Timeline from '../../components/ui/Resume/Timeline';
import useTranslation from '../../hooks/useTransalation';

const Resume = () => {
  const { t } = useTranslation();

  const { education, experience, skills } = useResume();
  return (
    <Article className="resume" name="article" header={t('resume')}>
      <Timeline name={t('education')} data={education} />
      <Timeline name={t('experience')} data={experience} />
      <Skills name={t('mySkills')} data={skills} />
    </Article>
  );
};

export default Resume;
