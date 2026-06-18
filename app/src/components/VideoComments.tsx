import { useState } from "react";
import {
  MessageCircle,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Reply,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import { formatNumber } from "@/lib/utils/format";

interface VideoCommentsProps {
  videoId: string;
}

export default function VideoComments({ videoId }: VideoCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: comments, isLoading } = trpc.douyin.comments.useQuery(
    { videoId },
    { enabled: isOpen && !!videoId }
  );

  return (
    <Card className="bg-slate-800/80 border-slate-700/50 overflow-hidden">
      <CardContent className="p-0">
        {/* Toggle Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-slate-700/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-white">
                评论列表
              </h3>
              <p className="text-xs text-slate-400">
                {comments && comments.length > 0
                  ? `共 ${comments.length} 条评论`
                  : "点击查看视频评论"}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Comments List */}
        {isOpen && (
          <div className="border-t border-slate-700/50">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <p className="text-sm text-slate-400">正在加载评论...</p>
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                {comments.map((comment, index) => (
                  <div
                    key={comment.cid || index}
                    className="flex gap-3 p-4 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-700/20 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {comment.avatar ? (
                        <img
                          src={comment.avatar}
                          alt={comment.user}
                          className="w-9 h-9 rounded-full border border-slate-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-blue-400">
                          {comment.user}
                        </span>
                        {comment.isAuthorLiked && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-pink-500/20 text-pink-400 font-medium">
                            作者赞过
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-200 leading-relaxed mb-2">
                        {comment.text}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{comment.createTime}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {formatNumber(comment.diggCount)}
                        </span>
                        {(comment.replyCommentTotal || 0) > 0 && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Reply className="w-3 h-3" />
                            {comment.replyCommentTotal} 条回复
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 mb-1">暂无评论数据</p>
                <p className="text-xs text-slate-600">
                  可能原因：评论未公开、链接已过期，或该视频暂无评论
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
