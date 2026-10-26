import { IoDocumentOutline } from 'react-icons/io5';

type EmptyListProps = {
  title: string;
};

const EmptyList = ({ title }: EmptyListProps) => {
  return (
    <div className="empty-list">
      <p>{title}</p>
      <IoDocumentOutline className="socials-icons empty-list-icon" aria-hidden="true" />
    </div>
  );
};

export default EmptyList;
