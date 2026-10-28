import { IoArrowBack, IoCodeSlashOutline, IoEyeOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import useProjectDetail from './useProjectDetail';
import Seo from '../../components/common/Seo';
import Article from '../../components/ui/Article';
import Lightbox from '../../components/ui/Portfolio/Lightbox';
import StackBadge from '../../components/ui/Portfolio/StackBadge';
import Section from '../../components/ui/Section';
import { getProjectPath } from '../../constants/projectSlugs';
import useTranslation from '../../hooks/useTransalation';
import NotFound from '../NotFound/NotFound';

// Image numbers shown to people start at 1.
const FIRST_IMAGE_NUMBER = 1;

const ProjectDetail = () => {
  const { t } = useTranslation();
  const { project, hasLiveSite, hasSourceCode, lightboxIndex, openLightbox, closeLightbox } =
    useProjectDetail();

  if (!project) {
    return <NotFound />;
  }

  const total = project.gallery.length;

  return (
    <Article className="project-detail" name="article" header={project.title}>
      <Seo
        title={project.title}
        description={project.summary}
        path={getProjectPath(project.slug)}
      />

      <div className="project-detail-meta">
        <Link to="/portfolio" className="project-detail-back">
          <IoArrowBack aria-hidden="true" />
          <span>{t('backToPortfolio')}</span>
        </Link>
        <p className="project-category">{project.category}</p>
      </div>

      <Section className="project-detail-section project-detail-about">
        {project.description.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </Section>

      <Section className="project-detail-section" name="project-detail" title={t('stack')}>
        <ul className="stack-list stack-list-lg">
          {project.stacks.map((stack) => (
            <StackBadge key={stack} label={stack} />
          ))}
        </ul>

        {(hasLiveSite || hasSourceCode) && (
          <div className="project-detail-links">
            {hasLiveSite && (
              <a
                className="form-btn"
                href={project.linkTo1}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('viewLiveSite', { project: project.title })}
              >
                <IoEyeOutline aria-hidden="true" />
                <span>{t('liveSite')}</span>
              </a>
            )}
            {hasSourceCode && (
              <a
                className="form-btn"
                href={project.linkTo2}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('viewSourceCode', { project: project.title })}
              >
                <IoCodeSlashOutline aria-hidden="true" />
                <span>{t('sourceCode')}</span>
              </a>
            )}
          </div>
        )}
      </Section>

      <Section className="project-detail-section" name="project-detail" title={t('gallery')}>
        <ul className="project-gallery">
          {project.gallery.map((image, index) => (
            <li key={image.src} className="project-gallery-item">
              <button
                type="button"
                className="project-gallery-btn"
                onClick={() => openLightbox(index)}
                aria-label={t('openImage', {
                  current: String(index + FIRST_IMAGE_NUMBER),
                  total: String(total),
                })}
              >
                <img
                  src={image.src}
                  alt=""
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Lightbox
        images={project.gallery}
        index={lightboxIndex}
        onClose={closeLightbox}
        onNavigate={openLightbox}
      />
    </Article>
  );
};

export default ProjectDetail;
