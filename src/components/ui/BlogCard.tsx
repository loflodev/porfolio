/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { Link } from 'react-router-dom';

import type { PostType } from '../../types';

interface BlogCardProps {
  data: PostType[];
}

const BlogCard = ({ data }: BlogCardProps) => {
  return data.map((item, index) => (
    <li key={`post-${index}`} className="blog-post-item">
      <Link to={item.to}>
        <figure className="blog-banner-box">
          <img src={item.image} alt={item.alt} loading="lazy" />
        </figure>

        <div className="blog-content">
          <div className="blog-meta">
            <p className="blog-category">{item.meta.category}</p>

            <span className="dot"></span>

            <time dateTime={item.meta.date}>{item.meta.date}</time>
          </div>

          <h3 className="h3 blog-item-title">{item.title}</h3>

          <p className="blog-text">{item.description}</p>
        </div>
      </Link>
    </li>
  ));
};

export default BlogCard;
