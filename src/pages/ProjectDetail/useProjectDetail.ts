import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { getProjectBySlug, translateProject } from '../../constants/projects';
import useTranslation from '../../hooks/useTransalation';

const NO_LINK = '#';

const useProjectDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const source = getProjectBySlug(slug);
  const project = source ? translateProject(source, t) : undefined;

  return {
    project,
    hasLiveSite: !!project && project.linkTo1 !== NO_LINK,
    hasSourceCode: !!project && project.linkTo2 !== NO_LINK,
    descriptionExpanded,
    toggleDescription: () => setDescriptionExpanded((prev) => !prev),
    lightboxIndex,
    openLightbox: setLightboxIndex,
    closeLightbox: () => setLightboxIndex(null),
  };
};

export default useProjectDetail;
