import useContact from './useContact';
import Article from '../../components/ui/Article';
import ContactForm from '../../components/ui/Contact/ContactForm';
import MapEmbed from '../../components/ui/MapEmbed';
import Modal from '../../components/ui/Modal';
import useTranslation from '../../hooks/useTransalation';

const Contact = () => {
  const { t } = useTranslation();
  const {
    showModal,
    toggleModal,
    modalData,
    contactFormInput,
    handleChange,
    isDisabled,
    handleIsDisabled,
    handleSubmit,
  } = useContact();

  return (
    <Article name="article" header={t('contact')} className="contact">
      <MapEmbed />

      <ContactForm
        data={contactFormInput}
        handleChange={handleChange}
        isDisabled={isDisabled}
        handleIsDisabled={handleIsDisabled}
        handleSubmit={handleSubmit}
      />
      <Modal showModal={showModal} handleModal={toggleModal} data={modalData} />
    </Article>
  );
};

export default Contact;
