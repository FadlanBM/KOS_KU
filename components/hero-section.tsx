"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    src: "https://mdbcdn.b-cdn.net/img/new/slides/041.webp",
    alt: "Wild Landscape",
  },
  {
    src: "https://mdbcdn.b-cdn.net/img/new/slides/042.webp",
    alt: "Camera",
  },
  {
    src: "https://mdbcdn.b-cdn.net/img/new/slides/043.webp",
    alt: "Exotic Fruits",
  },
];

function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="absolute inset-0 size-full">
      {/* Carousel Viewport */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, index) => (
            <div className="relative h-full flex-[0_0_100%]" key={index}>
              <img
                src={slide.src}
                className="block h-full w-full object-cover"
                alt={slide.alt}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-[2] mx-[15%] flex list-none justify-center p-0 gap-1">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`mx-[3px] box-content h-[3px] w-[30px] flex-initial cursor-pointer border-0 border-y-[10px] border-solid border-transparent bg-white bg-clip-padding p-0 -indent-[999px] transition-opacity duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1.0)] motion-reduce:transition-none ${
              index === selectedIndex ? "opacity-100" : "opacity-50"
            }`}
            aria-current={index === selectedIndex ? "true" : "false"}
            aria-label={`Slide ${index + 1}`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>

      {/* Prev Button */}
      <button
        className="absolute bottom-0 left-0 top-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
        type="button"
        onClick={scrollPrev}
      >
        <span className="inline-block h-8 w-8">
          <ChevronLeft className="h-8 w-8" />
        </span>
        <span className="sr-only">Previous</span>
      </button>

      {/* Next Button */}
      <button
        className="absolute bottom-0 right-0 top-0 z-[1] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
        type="button"
        onClick={scrollNext}
      >
        <span className="inline-block h-8 w-8">
          <ChevronRight className="h-8 w-8" />
        </span>
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
}

export default function HeroSection() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <HeroCarousel />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-5xl font-bold text-white md:text-6xl lg:text-7xl">
            Ship 10x Faster with NS
          </h1>
          <p className="mt-6 text-pretty text-lg text-gray-200 md:text-xl">
            Highly customizable components for building modern websites and
            applications that look and feel the way you mean it.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="px-8 text-base font-semibold">
              <Link href="#link">Start Building</Link>
            </Button>
            <Button
              key={2}
              asChild
              size="lg"
              variant="outline"
              className="px-8 text-base font-semibold bg-transparent text-white border-white hover:bg-white hover:text-black transition-colors"
            >
              <Link href="#link">Request a demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
