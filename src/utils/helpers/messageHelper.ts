import type { TMessagePositions, TMessageVariant } from "../../components/message";
import type { TNotifyContext } from "../contexts/message.context";

let notifyFn : TNotifyContext;

export const registerNotifier = (fn: TNotifyContext) => {
  notifyFn = fn;
};

export const notify = (msg: string, type?: TMessageVariant, position?: TMessagePositions) => {
  if (notifyFn) notifyFn(msg, type ?? 'INFO', position ?? 'bl');
};
