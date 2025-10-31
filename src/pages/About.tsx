import { useState } from 'react';
import { Link } from 'react-router-dom';

import Article from '../components/common/Article';
import { Card, type CardType } from '../components/common/Card';
import Modal from '../components/common/Modat';
import Section from '../components/common/Section';

export type modalInfoType = {
  alt: string;
  image: string;
  title: string;
  date?: string;
  description: string;
};

const About = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [modalInfo, setModalInfo] = useState<modalInfoType>({
    alt: '',
    title: '',
    date: '',
    description: '',
    image: '#',
  });
  const services: CardType[] = [
    {
      alt: 'design icon',
      title: 'Web design',
      picture: '/src/assets/image/icon-design.svg',
      description: 'The most modern and high-quality design made at a professional level.',
    },
    {
      alt: 'Web development icon',
      title: 'Web development',
      picture: '/src/assets/image/icon-dev.svg',
      description: 'High-quality development of sites at the professional level.',
    },
    {
      alt: 'mobile app icon',
      title: 'Mobile apps',
      picture: '/src/assets/image/icon-app.svg',
      description: 'Professional development of applications for iOS and Android.',
    },
    {
      alt: 'camera icon',
      title: 'Photography',
      picture: '/src/assets/image/icon-photo.svg',
      description: 'I make high-quality photos of any category at a professional level.',
    },
  ];

  const testimonies: CardType[] = [
    {
      alt: 'Daniel lewis',
      title: 'Daniel lewis',
      picture: '/src/assets/image/avatar-1.png',
      description: `Richard was hired to create a corporate identity. We were very pleased with the work done. She has a lot of experience and is very concerned about the needs of client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit, seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
    },
    {
      alt: 'Jessica miller',
      title: 'Jessica miller',
      picture: '/src/assets/image/avatar-2.png',
      description: `Richard was hired to create a corporate identity. We were very pleased with the
                  work done. She has a lot of experience and is very concerned about the needs of
                  client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit,
                  seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
    },
    {
      alt: 'Emily evans',
      title: 'Emily evans',
      picture: '/src/assets/image/avatar-3.png',
      description: `Richard was hired to create a corporate identity. We were very pleased with the
                  work done. She has a lot of experience and is very concerned about the needs of
                  client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit,
                  seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
    },
    {
      alt: 'Henry william"',
      title: 'Henry william',
      picture: '/src/assets/image/avatar-4.png',
      description: `Richard was hired to create a corporate identity. We were very pleased with the
                  work done. She has a lot of experience and is very concerned about the needs of
                  client. Lorem ipsum dolor sit amet, ullamcous cididt consectetur adipiscing elit,
                  seds do et eiusmod tempor incididunt ut laborels dolore magnarels alia.`,
    },
  ];

  const handleClick = () => {
    setIsActive((prev) => !prev);
  };
  const handleModalInfo = (info: modalInfoType) => {
    setModalInfo(info);
    handleClick();
  };

  return (
    <Article name="article" header="About me" className="about">
      <Section className="about-text">
        <p>
          I'm Creative Director and UI/UX Designer from Sydney, Australia, working in web
          development and print media. I enjoy turning complex problems into simple, beautiful and
          intuitive designs.
        </p>

        <p>
          My job is to build your website so that it is functional and user-friendly but at the same
          time attractive. Moreover, I add personal touch to your product and make sure that is
          eye-catching and easy to use. My aim is to bring across your message and identity in the
          most creative way. I created web design for many famous brand companies.
        </p>
      </Section>

      <Section name={'service'} title={"What i'm doing"} className="service">
        <Card type="service" cards={services} />
      </Section>

      <Section name="testimonials" title="Testimonials" className="testimonials">
        <Card type="testimony" cards={testimonies} handleModalInfo={handleModalInfo} />
      </Section>

      <Modal active={isActive} handleClick={handleClick} modalInfo={modalInfo} />

      <Section name={'clients'} title="Clients" className="clients">
        <ul className="clients-list has-scrollbar">
          <li className="clients-item">
            <Link to={'#'}>
              <img src="./assets/images/logo-1-color.png" alt="client logo" />
            </Link>
          </li>

          <li className="clients-item">
            <Link to={'#'}>
              <img src="./assets/images/logo-2-color.png" alt="client logo" />
            </Link>
          </li>

          <li className="clients-item">
            <Link to={'#'}>
              <img src="./assets/images/logo-3-color.png" alt="client logo" />
            </Link>
          </li>

          <li className="clients-item">
            <Link to={'#'}>
              <img src="./assets/images/logo-4-color.png" alt="client logo" />
            </Link>
          </li>

          <li className="clients-item">
            <Link to={'#'}>
              <img src="./assets/images/logo-5-color.png" alt="client logo" />
            </Link>
          </li>

          <li className="clients-item">
            <Link to={'#'}>
              <img src="./assets/images/logo-6-color.png" alt="client logo" />
            </Link>
          </li>
        </ul>
      </Section>
    </Article>
  );
};

export default About;
