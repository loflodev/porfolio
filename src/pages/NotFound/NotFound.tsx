import { Link } from 'react-router-dom';

import Seo from '../../components/common/Seo';
import Article from '../../components/ui/Article';
import useTranslation from '../../hooks/useTransalation';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Article name="article" header={t('notFoundTitle')} className="not-found">
      <Seo title={t('notFoundTitle')} description={t('notFoundDescription')} noindex />
      <p className="not-found-text">{t('notFoundDescription')}</p>
      <Link className="form-btn not-found-btn" to="/">
        <span>{t('backHome')}</span>
      </Link>
    </Article>
  );
};

export default NotFound;
