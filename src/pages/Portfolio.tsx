import Article from '../components/ui/Article';
import Tab from '../components/ui/Portfolio/Tab';
import useTab from '../components/ui/Portfolio/useTab';
import Section from '../components/ui/Section';
import ThumbnailCard from '../components/ui/ThumbnailCard';
import { PORTFOLIO } from '../constants';

const Portfolio = () => {
  const { category, handleTabSelect, activeIndex } = useTab();

  return (
    <Article className="portfolio" name="article" header="portfolio">
      <Section className="projects">
        <Tab data={category} handleSelect={handleTabSelect} activeTab={activeIndex} />
        <ThumbnailCard data={PORTFOLIO} category={category[activeIndex].title} />
      </Section>
    </Article>
  );
};

export default Portfolio;
