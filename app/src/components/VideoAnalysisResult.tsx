import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Bookmark,
  Clock,
  User,
  ExternalLink,
  TrendingUp,
  Award,
  Zap,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VideoComments from "./VideoComments";
import {
  formatNumber,
  formatFullNumber,
  formatDate,
  formatDuration,
  truncateText,
} from "@/lib/utils/format";
import type { VideoAnalysis } from "@/types/douyin";

interface VideoAnalysisResultProps {
  data: VideoAnalysis;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullValue: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, fullValue, color, bgColor }: StatCardProps) {
  return (
    <Card className="bg-slate-800/80 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
            {icon}
          </div>
          <Badge variant="secondary" className={`${bgColor} ${color} border-0 text-xs font-medium`}>
            {fullValue}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
          {value}
        </p>
        <p className="text-xs text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function VideoAnalysisResult({ data }: VideoAnalysisResultProps) {
  const stats = [
    {
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      label: "点赞数",
      value: formatNumber(data.likes),
      fullValue: formatFullNumber(data.likes),
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-blue-400" />,
      label: "评论数",
      value: formatNumber(data.comments),
      fullValue: formatFullNumber(data.comments),
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <Share2 className="w-5 h-5 text-emerald-400" />,
      label: "分享数",
      value: formatNumber(data.shares),
      fullValue: formatFullNumber(data.shares),
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: <Play className="w-5 h-5 text-violet-400" />,
      label: "播放数",
      value: formatNumber(data.plays),
      fullValue: formatFullNumber(data.plays),
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: <Bookmark className="w-5 h-5 text-amber-400" />,
      label: "收藏数",
      value: formatNumber(data.favorites),
      fullValue: formatFullNumber(data.favorites),
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      label: "视频时长",
      value: formatDuration(data.duration),
      fullValue: `${data.duration || 0} 秒`,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
  ];

  // 计算互动率
  const engagementRate =
    data.plays && data.plays > 0
      ? (((data.likes || 0) + (data.comments || 0) + (data.shares || 0)) / data.plays * 100).toFixed(2)
      : "0";

  // 计算点赞率
  const likeRate =
    data.plays && data.plays > 0
      ? ((data.likes || 0) / data.plays * 100).toFixed(2)
      : "0";

  // 传播指数
  const spreadScore = Math.min(
    Math.round(
      ((data.shares || 0) / Math.max(data.likes || 1, 1)) * 50 +
        ((data.plays || 0) / 10000)
    ),
    100
  );

  return (
    <div className="space-y-6">
      {/* Video Info Header */}
      <Card className="bg-slate-800/80 border-slate-700/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Cover Image */}
            <div className="w-full md:w-72 h-48 md:h-auto bg-slate-700/50 flex-shrink-0 relative overflow-hidden">
              {data.coverImage ? (
                <img
                  src={data.coverImage}
                  alt={data.title || "视频封面"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-slate-600" />
                </div>
              )}
              {data.duration ? (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
                  {formatDuration(data.duration)}
                </div>
              ) : null}
            </div>

            {/* Video Details */}
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                {data.title || "未获取到标题"}
              </h2>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                {truncateText(data.description, 200) || "暂无描述"}
              </p>

              <div className="flex items-center gap-3 mb-4">
                {data.authorAvatar ? (
                  <img
                    src={data.authorAvatar}
                    alt={data.author || ""}
                    className="w-8 h-8 rounded-full border border-slate-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <span className="text-sm text-slate-300">
                  {data.author || "未知作者"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>分析时间: {formatDate(data.createdAt)}</span>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => window.open(data.url, "_blank")}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  查看原视频
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-400" />
          数据统计
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Analysis Insights */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          数据洞察
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">互动率</p>
                  <p className="text-xl font-bold text-white">{engagementRate}%</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                (点赞+评论+分享) / 播放量
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">点赞率</p>
                  <p className="text-xl font-bold text-white">{likeRate}%</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                点赞数 / 播放量
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/80 border-slate-700/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">传播指数</p>
                  <p className="text-xl font-bold text-white">{spreadScore}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                基于分享/播放的综合评分 (0-100)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Comments Section */}
      <VideoComments videoId={data.videoId} />

      {/* Video ID Info */}
      <Card className="bg-slate-800/50 border-slate-700/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>视频ID:</span>
              <code className="px-2 py-0.5 bg-slate-700/50 rounded text-slate-400 font-mono">
                {data.videoId}
              </code>
            </div>
            <div className="text-xs text-slate-600">
              分析ID: #{data.id}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
