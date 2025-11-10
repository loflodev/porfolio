import Article from '../components/ui/Article';
import Archive from '../components/ui/Blog/Archive';
import Section from '../components/ui/Section';
import { POSTS } from '../constants';

const Blog = () => {
  return (
    <Article name="article" header="Blog" className="blog">
      <Section className="blog-posts">
        <Archive data={POSTS} />
      </Section>
    </Article>
  );
};

export default Blog;
