import { motion } from "motion/react";

interface IProps {
  className?: string;
}

const SpinnerPingPong = ({ className = "" }: IProps) => {
  return (
    <div className={`w-0.5 h-6 bg-primary-900/60 rounded-full relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute w-full bg-linear-to-b from-focus-100 to-focus-300 rounded-full shadow-xs"
        animate={{
          top: ["0%", "72%", "0%"],  
          height: ["12%", "28%", "12%"], 
        }}
        transition={{
          duration: 1.8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </div>
  );
};

export default SpinnerPingPong;

