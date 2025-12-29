import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

export function useParallax(distance: number = 100) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return { ref, y, opacity, scale, scrollYProgress };
}

export function useParallaxElement(
  scrollYProgress: MotionValue<number>,
  inputRange: number[] = [0, 1],
  outputRange: number[] = [-50, 50]
) {
  return useTransform(scrollYProgress, inputRange, outputRange);
}
