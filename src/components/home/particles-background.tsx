"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadLinksPreset } from "tsparticles-preset-links";
import type { Engine } from "tsparticles-engine";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadLinksPreset(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        preset: "links",
        background: {
          color: {
            value: "transparent",
          },
        },
        fullScreen: {
          enable: true,
          zIndex: 0,
        },
        particles: {
          color: {
            value: "#00ffff",
          },
          links: {
            color: "#00ffff",
            distance: 130,
            enable: true,
            opacity: 0.3,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            outModes: "bounce",
          },
          number: {
            value: 60,
          },
          opacity: {
            value: 0.5,
          },
          size: {
            value: 2,
          },
        },
      }}
    />
  );
}
