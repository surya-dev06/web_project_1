import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion()
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 32, filter: 'blur(5px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.18 }}
    transition={{ duration: reduced ? 0 : 0.72, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}