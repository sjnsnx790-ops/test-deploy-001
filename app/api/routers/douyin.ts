import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { parseDouyinVideo, extractVideoId, fetchVideoComments } from "../services/douyin";
import { getDb } from "../queries/connection";
import { videoAnalysis } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export const douyinRouter = createRouter({
  // 解析视频链接
  analyze: publicQuery
    .input(
      z.object({
        url: z.string().min(1, "请输入视频链接"),
      })
    )
    .mutation(async ({ input }) => {
      console.log("[API] analyze called with:", input.url);

      const videoId = extractVideoId(input.url);
      if (!videoId) {
        throw new Error("无法从链接中提取视频ID。请复制完整的分享链接，例如：https://v.douyin.com/xxxxx/");
      }
      console.log("[API] extracted videoId:", videoId);

      // 先检查是否已有分析记录
      const db = getDb();
      const existing = await db
        .select()
        .from(videoAnalysis)
        .where(eq(videoAnalysis.videoId, videoId))
        .limit(1);

      if (existing.length > 0) {
        console.log("[API] found existing record:", existing[0].id);
        return existing[0];
      }

      // 解析视频信息
      console.log("[API] parsing video...");
      const videoInfo = await parseDouyinVideo(input.url);
      console.log("[API] parsed video:", videoInfo.title, "likes:", videoInfo.likes);

      // 保存到数据库
      const result = await db.insert(videoAnalysis).values({
        videoId: videoInfo.videoId,
        url: videoInfo.url,
        title: videoInfo.title,
        author: videoInfo.author,
        authorAvatar: videoInfo.authorAvatar,
        coverImage: videoInfo.coverImage,
        description: videoInfo.description,
        likes: videoInfo.likes,
        comments: videoInfo.comments,
        shares: videoInfo.shares,
        plays: videoInfo.plays,
        favorites: videoInfo.favorites,
        duration: videoInfo.duration,
      });

      const inserted = await db
        .select()
        .from(videoAnalysis)
        .where(eq(videoAnalysis.id, Number(result[0].insertId)))
        .limit(1);

      console.log("[API] saved record:", inserted[0].id);
      return inserted[0];
    }),

  // 获取视频评论
  comments: publicQuery
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      console.log("[API] comments called for:", input.videoId);
      const comments = await fetchVideoComments(input.videoId);
      return comments;
    }),

  // 获取分析历史
  history: publicQuery.query(async () => {
    const db = getDb();
    const history = await db
      .select()
      .from(videoAnalysis)
      .orderBy(desc(videoAnalysis.createdAt))
      .limit(50);
    return history;
  }),

  // 删除分析记录
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(videoAnalysis).where(eq(videoAnalysis.id, input.id));
      return { success: true };
    }),

  // 清空历史
  clearHistory: publicQuery.mutation(async () => {
    const db = getDb();
    await db.delete(videoAnalysis);
    return { success: true };
  }),
});
