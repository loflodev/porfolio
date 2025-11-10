/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { PostType } from '../../../types';
import BlogCard from '../BlogCard';

interface ArchiveProps {
  data: PostType[];
}

const Archive = ({ data }: ArchiveProps) => {
  return (
    <ul className="blog-posts-list">
      <BlogCard data={data} />
    </ul>
  );
};

export default Archive;
