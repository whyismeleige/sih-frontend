"use client";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppAppBar from "./AppBar";
import Hero from "./Hero";
import Highlights from "./Highlights";
import Features from "./Features";
import FAQ from "./FAQ";
import Footer from "./Footer";
import AppTheme from "../theme/AppTheme";

function smoothScrollTo(target: HTMLElement, duration: number = 1000) {
  const start = window.scrollY;
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const distance = targetTop - start;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Ease in-out function
    const easeInOut =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, start + distance * easeInOut);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export default function LandingPage(props: { disableCustomTheme?: boolean }) {
  const refs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const setRef = (key: string, node: HTMLDivElement | null) => {
    if (node) refs.current[key] = node;
  };

  const scrollTo = (key: string) => {
    const target = refs.current[key];

    if (target) smoothScrollTo(target, 1000);
  };
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar scrollTo={scrollTo} />
      <Hero />
      <div>
        <Features setRef={setRef} />
        <Divider />
        <Highlights setRef={setRef} />
        <Divider />
        <FAQ setRef={setRef} />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
