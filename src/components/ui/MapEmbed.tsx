const MapEmbed = () => {
  return (
    <section className="mapbox" data-mapbox>
      <figure>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d89074.05473424382!2d-73.54488496725298!3d45.75988188433851!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc8e5cc87e498ff%3A0x6efa92668df92c85!2sRepentigny%2C%20Quebec!5e0!3m2!1ses-419!2sca!4v1772506004936!5m2!1ses-419!2sca"
          width="400"
          height="300"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </figure>
    </section>
  );
};

export default MapEmbed;
