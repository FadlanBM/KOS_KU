"use client";
import { Button } from "@/components/ui/button";
import { Search, SendHorizonal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  return (
    <>
      <section className="overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-20">
          <div className="lg:flex lg:items-center lg:gap-12">
            <div className="relative z-10 mx-auto max-w-xl text-center lg:ml-0 lg:w-1/2 lg:text-left">
              <h1 className="mt-10 text-balance text-4xl font-bold md:text-5xl xl:text-5xl">
                Mau cari kos?
              </h1>
              <p className="mt-8">
                Dapatkan infonya dan langsung sewa di Web Kosku.
              </p>

              <div>
                <form
                  action=""
                  className="mx-auto my-10 max-w-sm lg:my-12 lg:ml-0 lg:mr-auto"
                >
                  <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.75rem)] border pr-3 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                    <Search className="text-caption pointer-events-none absolute inset-y-0 left-5 my-auto size-5" />
                    <input
                      placeholder="Masukan nama lokasi/alamat"
                      className="h-14 w-full bg-transparent pl-12 focus:outline-none"
                      type="email"
                    />

                    <div className="md:pr-1.5 lg:pr-0">
                      <Button
                        aria-label="submit"
                        className="rounded-(--radius)"
                      >
                        <span className="hidden md:block">Cari Kos</span>
                        <SendHorizonal
                          className="relative mx-auto size-5 md:hidden"
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 -mx-4 rounded-3xl p-3 lg:col-span-3">
            <div className="relative">
              <div className="bg-radial-[at_65%_25%] to-background z-1 -inset-17 absolute from-transparent to-40%"></div>
              <Image
                className="hidden dark:block"
                src="/music.png"
                alt="app illustration"
                width={2796}
                height={2008}
              />
              <Image
                className="dark:hidden"
                src="/music-light.png"
                alt="app illustration"
                width={2796}
                height={2008}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
