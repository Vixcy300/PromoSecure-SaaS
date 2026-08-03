import { useCallback, useId } from "react";
import Particles, { ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// The init function must be defined at module level or wrapped in useCallback to be stable
function SparklesParticles({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#FFFFFF",
  background = "transparent",
  options = {},
}) {
  const id = useId();
  const { loaded } = useParticlesProvider();

  const defaultOptions = {
    background: {
      color: { value: background },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 120,
    particles: {
      color: { value: color },
      move: {
        enable: true,
        direction: "none",
        speed: {
          min: minSpeed || speed / 10,
          max: speed,
        },
        straight: false,
      },
      number: { value: density },
      opacity: {
        value: {
          min: minOpacity || opacity / 10,
          max: opacity,
        },
        animation: {
          enable: true,
          sync: false,
          speed: opacitySpeed,
        },
      },
      size: {
        value: {
          min: minSize || size / 2.5,
          max: size,
        },
      },
    },
    detectRetina: true,
  };

  if (!loaded) return null;

  return (
    <Particles
      id={id}
      options={{ ...defaultOptions, ...options }}
      className={className}
    />
  );
}

// Must be defined at module scope or be stable — defined here so it never changes
const initSlim = async (engine) => {
  await loadSlim(engine);
};

export function Sparkles(props) {
  return (
    <ParticlesProvider init={initSlim}>
      <SparklesParticles {...props} />
    </ParticlesProvider>
  );
}

export default Sparkles;
