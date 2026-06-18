import { createRouter, publicQuery } from "./middleware";
import { douyinRouter } from "./routers/douyin";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  douyin: douyinRouter,
});

export type AppRouter = typeof appRouter;
