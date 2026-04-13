import { motion } from 'framer-motion';

const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
}
