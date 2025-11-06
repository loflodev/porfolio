import useAbout from './useAbout';
import ClientSection from '../../components/ui/About/Client';
import Hero from '../../components/ui/About/Hero';
import Service from '../../components/ui/About/Service';
import Testimony from '../../components/ui/About/Testimony';
import Article from '../../components/ui/Article';
import Modal from '../../components/ui/Modal';
import { CLIENTS } from '../../constants';

const About = () => {
  const { showModal, modalData, toggleModal, handleModalData } = useAbout();
  return (
    <Article name="article" header="About me" className="about">
      <Hero />
      <Service />
      <Testimony handleTestimonyData={handleModalData} />
      <ClientSection clients={CLIENTS} />
      <Modal showModal={showModal} handleModal={toggleModal} data={modalData} />
    </Article>
  );
};

export default About;
