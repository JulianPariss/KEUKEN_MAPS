import { AnimatePresence, motion } from "motion/react";
import { MessageStyles } from "./styles";


export type TMessageVariant = 'INFO' | 'ERROR' | 'WARN' | 'SUCCESS';
export type TMessagePositions = 'bl' | 'br' | 'tl' | 'tr';


export interface IMessageProps {
  message: string;
  id: number;
  type?: TMessageVariant;
  position?: TMessagePositions;
  onClose?: () => void;
}

export const CustomMessage = ({ message, type = 'INFO', position = 'bl', onClose, id }: IMessageProps) => {
  if (!message) return null;

  const positions: { [key in TMessagePositions]: [number, number] } = {
    bl: [0, 50],
    br: [1680, 50],
    tl: [0, -820],
    tr: [1680, -820],
  }

  const xPos = positions[position][0];
  const yPos = positions[position][1];


  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={id}
          initial={{ opacity: 0, x: xPos, y: yPos }}
          animate={{ opacity: 1, x: xPos, y: (yPos + (yPos < 0 ? 50 : -50)) }}
          exit={{ opacity: 0, x: xPos, y: yPos }}
          transition={{ duration: 0.3 }}
          className={MessageStyles.variant(type)}
        >
          {message}
          {onClose && (
            <button className="cursor-pointer ml-2" onClick={onClose} aria-label="Close">
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}