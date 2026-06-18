import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
} from "drizzle-orm/mysql-core";

// 抖音视频分析记录表
export const videoAnalysis = mysqlTable("video_analysis", {
  id: serial("id").primaryKey(),
  videoId: varchar("video_id", { length: 255 }).notNull(),
  url: text("url").notNull(),
  title: text("title"),
  author: varchar("author", { length: 255 }),
  authorAvatar: text("author_avatar"),
  coverImage: text("cover_image"),
  description: text("description"),
  likes: bigint("likes", { mode: "number" }).default(0),
  comments: bigint("comments", { mode: "number" }).default(0),
  shares: bigint("shares", { mode: "number" }).default(0),
  plays: bigint("plays", { mode: "number" }).default(0),
  favorites: bigint("favorites", { mode: "number" }).default(0),
  duration: int("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
