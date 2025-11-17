import useTranslation from '../../../hooks/useTransalation';
import Section from '../Section';

const Hero = () => {
  const { t } = useTranslation();
  return (
    <Section className="about-text">
      <p>{t('aboutPage.description1')}</p>

      <p>{t('aboutPage.description2')}</p>
    </Section>
  );
};

export default Hero;
