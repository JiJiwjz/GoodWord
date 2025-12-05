import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ className, children, onClick, hover = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-6 relative overflow-hidden",
        hover ? "glass-card cursor-pointer" : "glass-panel",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
