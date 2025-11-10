import Article from '../components/ui/Article';
import ContactForm from '../components/ui/Contact/ContactForm';
import MapEmbed from '../components/ui/MapEmbed';

const Contact = () => {
  return (
    <Article name="article" header="contact" className="contact">
      <MapEmbed />

      <ContactForm />
    </Article>
  );
};

export default Contact;
