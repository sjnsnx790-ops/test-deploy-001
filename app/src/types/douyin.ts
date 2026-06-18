export interface VideoAnalysis {
  id: number;
  videoId: string;
  url: string;
  title: string | null;
  author: string | null;
  authorAvatar: string | null;
  coverImage: string | null;
  description: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  plays: number | null;
  favorites: number | null;
  duration: number | null;
  createdAt: Date;
}

export interface AnalysisStats {
  totalAnalyzed: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}
