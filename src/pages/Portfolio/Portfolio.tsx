import usePortfolio from './usePortfolio';
import Article from '../../components/ui/Article';
import Tab from '../../components/ui/Portfolio/Tab';
import Section from '../../components/ui/Section';
import ThumbnailCard from '../../components/ui/ThumbnailCard';
import useTranslation from '../../hooks/useTransalation';

const Portfolio = () => {
  const { t } = useTranslation();
  const { category, portfolio, handleTabSelect, activeIndex } = usePortfolio();

  return (
    <Article className="portfolio" name="article" header={t('portfolio')}>
      <Section className="projects">
        <Tab data={category} handleSelect={handleTabSelect} activeTab={activeIndex} />
        <ThumbnailCard data={portfolio} category={category[activeIndex].title} />
      </Section>
    </Article>
  );
};

export default Portfolio;
