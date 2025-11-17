import useAbout from './useAbout';
import ClientSection from '../../components/ui/About/Client';
import Hero from '../../components/ui/About/Hero';
import Service from '../../components/ui/About/Service';
import Testimony from '../../components/ui/About/Testimony';
import Article from '../../components/ui/Article';
import Modal from '../../components/ui/Modal';
import { CLIENTS } from '../../constants';
import useMainContext from '../../hooks/useMainContext';
import useTranslation from '../../hooks/useTransalation';

const About = () => {
  const { showModal, modalData, toggleModal, handleModalData } = useMainContext();
  const { services, testimonies } = useAbout();
  const { t } = useTranslation();
  return (
    <Article name="article" header={t('about.aboutMe')} className="about">
      <Hero />
      <Service data={services} />
      <Testimony data={testimonies} handleTestimonyData={handleModalData} />
      <ClientSection clients={CLIENTS} />
      <Modal showModal={showModal} handleModal={toggleModal} data={modalData} />
    </Article>
  );
};

export default About;
