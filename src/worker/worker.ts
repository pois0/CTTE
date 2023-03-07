import { setupWorker } from "../common/thread-pool";
import { MessageType, Request } from "../protocol";

export {};

declare const self: DedicatedWorkerGlobalScope;

setupWorker((req: Request) => {
  switch (req.messageType) {
  case MessageType.TransitionRequest:
    break;
  case MessageType.AntialiasingRequest:
    break;
  }
  return 0;
});
