import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CrossIcon } from '@repo/icons';
import { motion } from "motion/react";
import { useSidebarContext } from "./sidebar.context";
import { useAppSelector } from "../../store/hooks";
import { ViewContext } from "./view.context";

export interface IContextbarContext {
  isOpen: boolean;
  content: ReactNode | null;
  open: (content: ReactNode, title?: ReactNode, openKey?: string) => void;
  toggle: (content: ReactNode, title?: ReactNode, openKey?: string) => void;
  update: (content: ReactNode, openKey: string) => void;
  close: () => void;
  openKey: string | null;
}

const ContextbarContext = createContext<IContextbarContext | null>(null);

export function ContextbarProvider({ children }: { children: ReactNode }) {
  const { enterprise_id } = useAppSelector((state) => state.user.enterprise);
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<ReactNode | null>(null);
  const [currentOpenKey, setCurrentOpenKey] = useState<string | null>(null);
  const { isCollapsed } = useSidebarContext();
  const viewCtx = useContext(ViewContext);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    close();
  }, [enterprise_id, viewCtx?.view])

  const toggle = (node: ReactNode, nodeTitle?: ReactNode, openKey?: string) => {
    if (isOpen && openKey == currentOpenKey) {
      close();
      return;
    } else {
      setContent(node);
      setTitle(nodeTitle ?? null);
      setCurrentOpenKey(openKey ?? null);
      setIsOpen(true);
    }
  };

  const open = (node: ReactNode, nodeTitle?: ReactNode, openKey?: string) => {
    setContent(node);
    setTitle(nodeTitle ?? null);
    setCurrentOpenKey(openKey ?? null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setContent(null);
    setTitle(null);
    setCurrentOpenKey(null)
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [currentOpenKey]);

  const update = (node: ReactNode, openKey: string) => {
    setCurrentOpenKey((prevKey) => {
      if (prevKey === openKey) {
        setContent(node);
      }
      return prevKey;
    });
  };

  return (
    <ContextbarContext.Provider
      value={{ isOpen, content, open, close, openKey: currentOpenKey, toggle, update }}
    >
      {isOpen && (
        <motion.div
          initial={{ right: '405px' }}
          animate={{ right: isCollapsed ? '20px' : '405px' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="max-w-[300px] w-fit h-[calc(100vh-110px)] absolute top-[105px] right-[405px] z-[1001]"
        >
          <div
            onClick={close}
            className="absolute size-7 top-2 -left-3.5 z-[99999] shadow-md shadow-black/40 hover:shadow-lg bg-primary-900/90 hover:bg-focus-500/30 active:bg-focus-500/50 border border-main/15 rounded-full flex justify-center items-center hover:scale-105 transition-all cursor-pointer"
          >
            <CrossIcon className="size-4.5 rotate-90 stroke-main" />
          </div>

          <div
            key={currentOpenKey}
            className="h-full w-full border border-main/10 rounded-dx overflow-hidden shadow-2xl shadow-black/60 flex flex-col"
          >
            <div className="w-full sticky top-0 z-50 bg-primary-950/95 backdrop-blur-xl h-[42px] px-3 py-2 flex items-center justify-center border-b border-main/10 text-main shadow-xs font-semibold text-sm">
              {title}
            </div>
            <div
              ref={scrollRef}
              className="overflow-y-scroll h-full bg-linear-to-b from-primary-900/95 to-primary-950/95 backdrop-blur-2xl w-full text-main"
            >
              {content}
            </div>
          </div>
        </motion.div>
      )}

      {children}
    </ContextbarContext.Provider>
  );
}

export function useContextbarContext(): IContextbarContext {
  const context = useContext(ContextbarContext);
  if (!context) {
    throw new Error("ContextbarContext not initialized");
  }
  return context;
}

