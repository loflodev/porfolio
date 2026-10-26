/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { DEFAULT_STATE_NUMBER } from '../../../constants';
import useTranslation from '../../../hooks/useTransalation';
import type { PostType } from '../../../types';
import BlogCard from '../BlogCard';
import EmptyList from '../EmptyList';

interface ArchiveProps {
  data: PostType[];
}

const Archive = ({ data }: ArchiveProps) => {
  const { t } = useTranslation();

  if (data.length === DEFAULT_STATE_NUMBER) {
    return <EmptyList title={t('blogEmpty')} />;
  }
  return <ul className="blog-posts-list">{<BlogCard data={data} />}</ul>;
};

export default Archive;
