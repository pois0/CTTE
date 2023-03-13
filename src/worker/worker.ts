import { setupWorker } from "../common/thread-pool";
import { MessageType, Request, TransitionRequest } from "../common/protocol";
import { getAntiAliasedImagePartially, transitImagePartially } from "../common/images";

declare const self: DedicatedWorkerGlobalScope;
export {};

setupWorker(self, (req: Request) => {
  switch (req.messageType) {
  case MessageType.TransitionRequest: {
    const q = req as TransitionRequest;
    transitImagePartially(new Float32Array(q.from), new Float32Array(q.to), q.offsetX, q.lengthX, q.height, q.width, q.magic);
  } break;
  case MessageType.AntialiasingRequest: {
    const q = req;
    getAntiAliasedImagePartially(new Float32Array(q.from), new Float32Array(q.to), q.offsetX, q.lengthX, q.height, q.width);
  } break;
  }
  return 0;
});
