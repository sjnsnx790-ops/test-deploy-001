import axios from "axios";

export interface DouyinVideoInfo {
  videoId: string;
  url: string;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  plays: number;
  favorites: number;
  duration: number;
  createTime?: string;
  tags?: string[];
}

export interface DouyinComment {
  cid: string;
  user: string;
  avatar: string;
  text: string;
  diggCount: number;
  createTime: string;
  replyCommentTotal?: number;
  isAuthorLiked?: boolean;
}

/**
 * 从各种抖音链接格式中提取视频ID
 */
export function extractVideoId(url: string): string | null {
  const shortLinkMatch = url.match(/v\.douyin\.com\/([a-zA-Z0-9_-]+)/);
  if (shortLinkMatch) return shortLinkMatch[1];

  const videoMatch = url.match(/video\/(\d+)/);
  if (videoMatch) return videoMatch[1];

  const noteMatch = url.match(/note\/(\d+)/);
  if (noteMatch) return noteMatch[1];

  return null;
}

/**
 * 从分享文本中提取抖音链接
 */
export function extractUrlFromText(text: string): string | null {
  const urlMatch = text.match(/(https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];

  const urlMatch2 = text.match(/(https?:\/\/www\.douyin\.com\/video\/\d+)/);
  if (urlMatch2) return urlMatch2[1];

  const urlMatch3 = text.match(/(https?:\/\/www\.iesdouyin\.com\/share\/video\/\d+)/);
  if (urlMatch3) return urlMatch3[1];

  return null;
}

/**
 * 解析抖音分享链接，获取视频信息
 */
export async function parseDouyinVideo(inputUrl: string): Promise<DouyinVideoInfo> {
  // 从输入文本中提取链接
  let url = extractUrlFromText(inputUrl) || inputUrl;

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("无法从链接中提取视频ID，请检查链接格式是否正确。支持的格式：v.douyin.com/xxxxx");
  }

  console.log(`[DouyinParser] Starting parse for videoId: ${videoId}`);
  console.log(`[DouyinParser] URL: ${url}`);

  try {
    const html = await fetchVideoPage(url);
    console.log(`[DouyinParser] Fetched HTML, length: ${html.length}`);

    // 尝试从 _ROUTER_DATA 中提取
    const routerData = extractRouterData(html);
    if (routerData) {
      console.log(`[DouyinParser] Parsed from _ROUTER_DATA successfully`);
      return routerData;
    }

    // 回退：尝试从 _SSR_DATA 中提取
    const ssrData = extractSsrData(html);
    if (ssrData) {
      console.log(`[DouyinParser] Parsed from _SSR_DATA successfully`);
      return ssrData;
    }

    // 尝试从 meta 标签提取
    const metaData = extractMetaData(html, videoId, url);
    if (metaData) {
      console.log(`[DouyinParser] Parsed from meta tags`);
      return metaData;
    }

    throw new Error("无法从页面中解析视频数据。可能的原因：\n1. 链接已过期\n2. 视频已被删除或设为私密\n3. 网络访问受限\n请尝试使用其他链接");
  } catch (error) {
    console.error(`[DouyinParser] Parse failed:`, error);
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
        throw new Error("网络连接失败，无法访问抖音服务器。请稍后重试。");
      }
      throw new Error(`请求失败: ${error.message}。请检查链接是否有效。`);
    }
    if (error instanceof Error) throw error;
    throw new Error("视频解析失败，请检查链接是否有效或稍后重试");
  }
}

/**
 * 获取视频评论
 */
export async function fetchVideoComments(videoId: string): Promise<DouyinComment[]> {
  console.log(`[DouyinParser] Fetching comments for video: ${videoId}`);

  try {
    const url = `https://www.douyin.com/video/${videoId}`;
    const html = await fetchVideoPage(url);

    // 尝试从 _ROUTER_DATA 中获取评论
    const routerMatch = html.match(/window\._ROUTER_DATA\s*=\s*({.+?})<\/script>/s);
    if (routerMatch) {
      try {
        const routerData = JSON.parse(routerMatch[1]);
        const commentsList = routerData?.loaderData?.["video_(id)/page"]?.comments?.comments;
        if (commentsList && Array.isArray(commentsList)) {
          return commentsList.map((c: any) => ({
            cid: c.cid || "",
            user: c.user?.nickname || "未知用户",
            avatar: c.user?.avatar_thumb?.url_list?.[0] || "",
            text: c.text || "",
            diggCount: c.digg_count || 0,
            createTime: c.create_time
              ? new Date(c.create_time * 1000).toLocaleString("zh-CN")
              : "",
            replyCommentTotal: c.reply_comment_total || 0,
            isAuthorLiked: !!c.is_author_liked,
          }));
        }
      } catch (e) {
        console.error("[DouyinParser] Failed to parse comments from router data:", e);
      }
    }

    // 如果从router data获取失败，返回空数组
    return [];
  } catch (error) {
    console.error(`[DouyinParser] Fetch comments failed:`, error);
    return [];
  }
}

/**
 * 获取视频页面HTML
 */
async function fetchVideoPage(url: string): Promise<string> {
  // 如果是短链接，先用HEAD请求获取重定向后的URL
  let targetUrl = url;
  if (url.includes("v.douyin.com")) {
    try {
      const headResp = await axios.head(url, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
          Accept: "text/html",
        },
      });
      targetUrl = headResp.request.res?.responseUrl || url;
      console.log(`[DouyinParser] Redirected to: ${targetUrl}`);
    } catch {
      // 如果HEAD失败，继续使用原始URL
    }
  }

  const response = await axios.get(targetUrl, {
    timeout: 15000,
    maxRedirects: 5,
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Accept-Encoding": "gzip, deflate",
      Referer: "https://www.douyin.com/",
    },
  });

  return response.data;
}

/**
 * 从 window._ROUTER_DATA 中提取
 */
function extractRouterData(html: string): DouyinVideoInfo | null {
  const routerMatch = html.match(/window\._ROUTER_DATA\s*=\s*({[\s\S]+?})<\/script>/);
  if (!routerMatch) return null;

  try {
    const routerData = JSON.parse(routerMatch[1]);
    const videoPage = routerData?.loaderData?.["video_(id)/page"];
    if (!videoPage) return null;

    const videoInfoRes = videoPage.videoInfoRes;
    if (!videoInfoRes?.item_list || videoInfoRes.item_list.length === 0) {
      return null;
    }

    return parseVideoItem(videoInfoRes.item_list[0]);
  } catch (e) {
    console.error("[DouyinParser] _ROUTER_DATA parse error:", e);
    return null;
  }
}

/**
 * 从 window._SSR_DATA 中提取
 */
function extractSsrData(html: string): DouyinVideoInfo | null {
  const ssrMatch = html.match(/window\._SSR_DATA\s*=\s*({[\s\S]+?})<\/script>/);
  if (!ssrMatch) return null;

  try {
    const ssrData = JSON.parse(ssrMatch[1]);
    const videoDetail = ssrData?.app?.videoDetail;
    if (!videoDetail) return null;

    const item = videoDetail.itemInfo?.itemStruct || videoDetail.info?.video?.[0];
    if (!item) return null;

    return parseVideoItem(item);
  } catch (e) {
    console.error("[DouyinParser] _SSR_DATA parse error:", e);
    return null;
  }
}

/**
 * 从 meta 标签提取基本信息
 */
function extractMetaData(html: string, videoId: string, url: string): DouyinVideoInfo | null {
  try {
    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/);
    const coverMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/);

    if (!titleMatch && !descMatch) return null;

    const desc = decodeHtmlEntities(descMatch?.[1] || titleMatch?.[1] || "");
    const tags = extractTags(desc);

    return {
      videoId,
      url,
      title: desc.substring(0, 100) || "抖音视频",
      author: "未知作者",
      authorAvatar: "",
      coverImage: coverMatch?.[1] || "",
      description: desc,
      likes: 0,
      comments: 0,
      shares: 0,
      plays: 0,
      favorites: 0,
      duration: 0,
      tags,
    };
  } catch {
    return null;
  }
}

/**
 * 统一解析视频item
 */
function parseVideoItem(item: any): DouyinVideoInfo | null {
  if (!item || !item.aweme_id) return null;

  const stats = item.statistics || {};
  const author = item.author || {};
  const video = item.video || {};

  let coverImage = "";
  if (video.cover && typeof video.cover === "object") {
    coverImage = video.cover.url_list?.[0] || "";
  }

  let authorAvatar = "";
  if (author.avatar_thumb && typeof author.avatar_thumb === "object") {
    authorAvatar = author.avatar_thumb.url_list?.[0] || "";
  }

  const desc = item.desc || "";
  const tags = extractTags(desc);

  return {
    videoId: item.aweme_id,
    url: item.share_url || `https://www.douyin.com/video/${item.aweme_id}`,
    title: desc.substring(0, 100) || "抖音视频",
    author: author.nickname || "未知作者",
    authorAvatar,
    coverImage,
    description: desc,
    likes: stats.digg_count || 0,
    comments: stats.comment_count || 0,
    shares: stats.share_count || 0,
    plays: stats.play_count || 0,
    favorites: stats.collect_count || 0,
    duration: parseDuration(video.duration),
    createTime: item.create_time
      ? new Date(item.create_time * 1000).toISOString()
      : undefined,
    tags,
  };
}

function extractTags(desc: string): string[] {
  const tagMatches = desc.match(/#[\u4e00-\u9fa5\w]+/g);
  if (tagMatches) {
    return tagMatches.map((t) => t.replace("#", ""));
  }
  return [];
}

function parseDuration(raw: number | undefined): number {
  if (!raw || raw <= 0) return 0;
  if (raw > 10000000) return Math.round(raw / 1000000);
  if (raw > 1000) return Math.round(raw / 1000);
  return raw;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => entities[match] || match);
}
