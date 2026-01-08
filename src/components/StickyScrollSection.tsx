import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

interface StickyScrollSectionProps {
  children: ReactNode;
  bgColor?: string;
  id?: string;
}

export const StickyScrollSection = ({ 
  children, 
  bgColor = "bg-background",
  id 
}: StickyScrollSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  return (
    <div ref={containerRef} id={id} className={`min-h-screen sticky top-0 ${bgColor} z-10`}>
      <motion.div 
        className="min-h-screen flex items-center"
        style={{ opacity, scale, y }}
      >
        {children}
      </motion.div>
    </div>
  );
};

interface ScrollSnapContainerProps {
  children: ReactNode;
}

export const ScrollSnapContainer = ({ children }: ScrollSnapContainerProps) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

export default StickyScrollSection;
