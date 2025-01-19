import { motion, useAnimation ,AnimatePresence} from 'framer-motion';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const AnimatedView = ({ children, delay }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
  });

  // Set up the animation variants
  const variants = {
    hidden: { opacity: 0, y: 1 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    // Trigger animation when component is in view
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  return (
    // <AnimatePresence mode='wait'>
      <motion.div
        ref={ref}
        initial='hidden'
        animate={controls}
        variants={variants}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.3, delay: delay || 0.3 }}
      >
        {children}
      </motion.div>
    // </AnimatePresence>
  );
};

export default AnimatedView;
