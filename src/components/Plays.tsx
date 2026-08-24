'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './Plays.module.css';
import Modal from './Modal';
import type { Play } from '@/types/play';

type PlaysProps = {
  plays: Play[];
};

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

export default function Plays({ plays }: PlaysProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: false,
  });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredWorks = useMemo(
    () => plays.filter((work) => work.featured),
    [plays],
  );

  const handleOpenModal = (play: Play) => {
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
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section id="plays" className={styles.playsSection}>
      <h2 className={styles.heading}>Selected Works</h2>
      <div
        className={styles.embla}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured plays"
      >
        <div className={styles.visuallyHidden} aria-live="polite" aria-atomic="true">
          {featuredWorks.length > 0 &&
            `Slide ${currentSlide + 1} of ${featuredWorks.length}: ${featuredWorks[currentSlide]?.title ?? ''}`}
        </div>
        <div className={styles.embla__viewport} ref={emblaRef}>
          <div className={styles.embla__container}>
            {featuredWorks.map((work) => (
              <div className={styles.embla__slide} key={work.slug}>
                <button
                  onClick={() => handleOpenModal(work)}
                  className={styles.slide__link}
                  data-umami-event="play-modal-open"
                  data-umami-event-play={work.slug}
                >
                  <div className={styles.slide__image_wrapper}>
                    {work.published && (
                      <div className={styles.ribbon}>Published</div>
                    )}
                    <Image
                      src={work.imageSrc}
                      alt={`Cover for ${work.title}`}
                      width={400}
                      height={600}
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
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
