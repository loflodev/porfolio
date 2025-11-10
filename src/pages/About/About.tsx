import ClientSection from '../../components/ui/About/Client';
import Hero from '../../components/ui/About/Hero';
import Service from '../../components/ui/About/Service';
import Testimony from '../../components/ui/About/Testimony';
import Article from '../../components/ui/Article';
import Modal from '../../components/ui/Modal';
import { CLIENTS } from '../../constants';
import useMainContext from '../../hooks/useMainContext';

const About = () => {
  const { showModal, modalData, toggleModal, handleModalData } = useMainContext();
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
