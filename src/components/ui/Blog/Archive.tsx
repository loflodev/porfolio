/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { DEFAULT_STATE_NUMBER } from '../../../constants';
import type { PostType } from '../../../types';
import BlogCard from '../BlogCard';
import EmptyList from '../EmptyList';

interface ArchiveProps {
  data: PostType[];
}

const Archive = ({ data }: ArchiveProps) => {
  if (data.length === DEFAULT_STATE_NUMBER) {
    return <EmptyList title="Nothing to read right now" />;
  }
  return <ul className="blog-posts-list">{<BlogCard data={data} />}</ul>;
};

export default Archive;
