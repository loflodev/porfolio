import useTranslation from '../../../hooks/useTransalation';
import Section from '../Section';

const Hero = () => {
  const { t } = useTranslation();
  return (
    <Section className="about-text">
      <p>{t('about.description1')}</p>

      <p>{t('about.description2')}</p>
    </Section>
  );
};

export default Hero;
