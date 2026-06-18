import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Trash2,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/providers/trpc";
import { formatNumber, formatDate, truncateText } from "@/lib/utils/format";
import type { VideoAnalysis } from "@/types/douyin";
import { toast } from "sonner";

interface AnalysisHistoryProps {
  history: VideoAnalysis[];
  onItemClick: (url: string) => void;
}

export default function AnalysisHistory({
  history,
  onItemClick,
}: AnalysisHistoryProps) {
  const utils = trpc.useUtils();

  const deleteMutation = trpc.douyin.delete.useMutation({
    onSuccess: () => {
      utils.douyin.history.invalidate();
      toast.success("已删除记录");
    },
    onError: () => {
      toast.error("删除失败");
    },
  });

  const clearMutation = trpc.douyin.clearHistory.useMutation({
    onSuccess: () => {
      utils.douyin.history.invalidate();
      toast.success("已清空历史");
    },
    onError: () => {
      toast.error("清空失败");
    },
  });

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate({ id });
  };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          暂无历史记录
        </h3>
        <p className="text-sm text-slate-500">
          分析过的视频将显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          共 {history.length} 条分析记录
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              清空历史
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                确认清空历史
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                此操作将删除所有分析记录，且无法恢复。是否继续？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                取消
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clearMutation.mutate()}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                确认清空
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.map((item) => (
          <Card
            key={item.id}
            className="bg-slate-800/80 border-slate-700/50 hover:border-pink-500/30 cursor-pointer transition-all duration-200 group"
            onClick={() => onItemClick(item.url)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Cover */}
                <div className="w-20 h-20 rounded-lg bg-slate-700/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title || ""}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Play className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1 truncate group-hover:text-pink-400 transition-colors">
                    {item.title || "未获取到标题"}
                  </h4>
                  <p className="text-xs text-slate-400 mb-2">
                    {truncateText(item.description, 80) || "暂无描述"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      {formatNumber(item.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-blue-400" />
                      {formatNumber(item.comments)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-emerald-400" />
                      {formatNumber(item.shares)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-violet-400" />
                      {formatNumber(item.plays)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-600">
                      {item.author || "未知作者"} · {formatDate(item.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-slate-500 hover:text-pink-400 hover:bg-pink-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, "_blank");
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        原视频
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleDelete(item.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
