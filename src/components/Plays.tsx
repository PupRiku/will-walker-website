'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './Plays.module.css';
import Modal from './Modal';
import { worksData, type Work } from '@/data/works';

const PrevButton = (props: { onClick: () => void; enabled: boolean }) => (
  <button
    className={`${styles.embla__button} ${styles.embla__button__prev}`}
    onClick={props.onClick}
    disabled={!props.enabled}
    aria-label="Previous slide"
  >
    <svg className={styles.embla__button__svg} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      />
    </svg>
  </button>
);

const NextButton = (props: { onClick: () => void; enabled: boolean }) => (
  <button
    className={`${styles.embla__button} ${styles.embla__button__next}`}
    onClick={props.onClick}
    disabled={!props.enabled}
    aria-label="Next slide"
  >
    <svg className={styles.embla__button__svg} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
      />
    </svg>
  </button>
);

export default function Plays() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<Work | null>(null);

  const handleOpenModal = (play: Work) => {
    setSelectedPlay(play);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const featuredWorks = worksData.filter((work) => work.featured === true);

  return (
    <section id="plays" className={styles.playsSection}>
      <h2 className={styles.heading}>Selected Works</h2>
      <div className={styles.embla}>
        <div className={styles.embla__viewport} ref={emblaRef}>
          <div className={styles.embla__container}>
            {featuredWorks.map((work, index) => (
              <div className={styles.embla__slide} key={index}>
                <button
                  onClick={() => handleOpenModal(work)}
                  className={styles.slide__link}
                >
                  <div className={styles.slide__image_wrapper}>
                    <Image
                      src={work.imageSrc}
                      alt={`Cover for ${work.title}`}
                      width={400}
                      height={600}
                      className={styles.slide__image}
                    />
                  </div>
                  <h3 className={styles.slide__title}>{work.title}</h3>
                  <p className={styles.slide__category}>{work.category}</p>
                </button>
              </div>
            ))}
          </div>
        </div>
        <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
        <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
      </div>
      <Link href="/works" className={styles.seeAllButton}>
        See all of Will&apos;s work →
      </Link>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        play={selectedPlay}
      />
    </section>
  );
}
