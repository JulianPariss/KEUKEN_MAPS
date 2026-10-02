import { createContext, useRef, useState, useEffect } from 'react';
import { CustomMessage, type TMessagePositions, type TMessageVariant } from '../../components/message';
import { registerNotifier } from '../helpers/messageHelper';

interface IMessageProviderProps {
  children: React.ReactNode;
  delay?: number;
}

export interface IQueueNotification {
  message: string; 
  type: TMessageVariant; 
  position: TMessagePositions; 
  id: number;
}

export type TNotifyContext = (message: string, type: TMessageVariant, position?: TMessagePositions) => void;

export const MessageContext = createContext<TNotifyContext | null>(null);

export const MessageProvider = ({ children, delay = 2000 }: IMessageProviderProps) => {
  const [currentMessage, setCurrentMessage] = useState<IQueueNotification | undefined>(undefined);
  const [type, setType] = useState<TMessageVariant>('INFO');
  const [position, setPosition] = useState<TMessagePositions>('bl');
  const idRef = useRef<number>(0);

  const queueRef = useRef<IQueueNotification[]>([]);
  const timeoutRef = useRef<number | undefined>(undefined);
  const isShowingRef = useRef(false);

  const showNext = () => {
    if (queueRef.current.length === 0) {
      setCurrentMessage(undefined);
      setType('INFO');
      setPosition('bl');
      isShowingRef.current = false;
      return;
    }

    const nextMsg = queueRef.current.shift();
    if (!nextMsg) return;

    setCurrentMessage(nextMsg);
    setType(nextMsg.type);
    setPosition(nextMsg.position);
    isShowingRef.current = true;

    if (nextMsg.type !== 'ERROR') {
      timeoutRef.current = window.setTimeout(showNext, delay);
    }
  };

  const closeCurrentMessage = () => {
    clearTimeout(timeoutRef.current);
    showNext();
  };

  const notify: TNotifyContext = (message, type = 'INFO', position = 'bl') => {
    queueRef.current.push({ message, type, id: ++idRef.current, position });
    if (!isShowingRef.current) {
      showNext();
    }
  };

  useEffect(() => {
    registerNotifier(notify);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <MessageContext.Provider value={notify}>
      {children}
      <CustomMessage
        id={currentMessage?.id ?? Math.random()*100}
        message={currentMessage?.message ?? ''}
        type={type}
        position={position}
        onClose={type === 'ERROR' ? closeCurrentMessage : undefined}
      />
    </MessageContext.Provider>
  );
};

