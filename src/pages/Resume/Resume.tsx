import useResume from './useResume';
import Seo from '../../components/common/Seo';
import Article from '../../components/ui/Article';
import Skills from '../../components/ui/Resume/Skills';
import Timeline from '../../components/ui/Resume/Timeline';
import useTranslation from '../../hooks/useTransalation';

const Resume = () => {
  const { t } = useTranslation();

  const { education, experience, skills } = useResume();
  return (
    <Article className="resume" name="article" header={t('resume')}>
      <Seo
        title="Resume"
        description="Louis Florival's resume: education, work experience, and full stack development skills."
        path="/resume"
      />
      <Timeline name={t('education')} data={education} />
      <Timeline name={t('experience')} data={experience} />
      <Skills name={t('mySkills')} data={skills} />
    </Article>
  );
};

export default Resume;
