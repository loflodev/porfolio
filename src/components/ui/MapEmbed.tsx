const MapEmbed = () => {
  return (
    <section className="mapbox" data-mapbox>
      <figure>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5565.017753669842!2d-73.4157067589643!3d45.78103197120126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc8ef6a64c3dba3%3A0xaa8cb00595912e94!2s1242%20Rue%20R%C3%A9migny%2C%20Repentigny%2C%20QC%20J5Y%203P9!5e0!3m2!1ses-419!2sca!4v1769025889041!5m2!1ses-419!2sca"
          width="400"
          height="300"
          loading="lazy"
        ></iframe>
      </figure>
    </section>
  );
};

export default MapEmbed;
