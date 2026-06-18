import { useState } from "react";
import {
  Link2,
  History,
  BarChart3,
  Sparkles,
  ClipboardPaste,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/providers/trpc";
import VideoAnalysisResult from "@/components/VideoAnalysisResult";
import AnalysisHistory from "@/components/AnalysisHistory";
import { toast } from "sonner";

export default function Home() {
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] = useState("analyze");
  const [lastAnalyzedId, setLastAnalyzedId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const analyzeMutation = trpc.douyin.analyze.useMutation({
    onSuccess: (data) => {
      console.log("[Home] Analyze success:", data);
      utils.douyin.history.invalidate();
      toast.success("视频分析完成！");
      setLastAnalyzedId(data.id);
      setActiveTab("result");
    },
    onError: (error) => {
      console.error("[Home] Analyze error:", error);
      toast.error(error.message || "分析失败，请检查链接格式");
    },
  });

  const { data: history } = trpc.douyin.history.useQuery();

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast.error("请输入抖音分享链接");
      return;
    }
    // 检查是否包含 douyin 链接
    if (!url.includes("douyin")) {
      toast.error("请输入有效的抖音链接（包含 douyin.com）");
      return;
    }
    console.log("[Home] Starting analysis for:", url);
    analyzeMutation.mutate({ url: url.trim() });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast.success("已粘贴链接");
    } catch {
      toast.error("无法访问剪贴板，请手动粘贴");
    }
  };

  const handleHistoryClick = (videoUrl: string) => {
    setUrl(videoUrl);
    setActiveTab("analyze");
  };

  // 获取最新的分析结果（优先使用刚分析的，否则用历史第一个）
  const latestResult = lastAnalyzedId
    ? history?.find((h) => h.id === lastAnalyzedId)
    : history?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                抖音视频分析
              </h1>
              <p className="text-xs text-slate-400">粘贴链接，一键解析视频数据</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <BarChart3 className="w-4 h-4" />
            <span>已分析 {history?.length || 0} 个视频</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/80 border border-slate-700/50 p-1 rounded-xl">
            <TabsTrigger
              value="analyze"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white px-6"
            >
              <Link2 className="w-4 h-4 mr-2" />
              视频解析
            </TabsTrigger>
            <TabsTrigger
              value="result"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white px-6"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              分析结果
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white px-6"
            >
              <History className="w-4 h-4 mr-2" />
              历史记录
            </TabsTrigger>
          </TabsList>

          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-6">
            {/* Input Section */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  粘贴抖音分享链接
                </h2>
                <p className="text-slate-400">
                  直接复制抖音APP的分享文案粘贴即可，自动提取链接
                </p>
              </div>

              <div className="flex gap-3 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="复制抖音分享链接粘贴到这里..."
                    className="h-12 bg-slate-900/80 border-slate-600 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-pink-500 focus-visible:ring-offset-0 pr-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAnalyze();
                    }}
                  />
                  <button
                    onClick={handlePaste}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-pink-400 transition-colors"
                    title="从剪贴板粘贴"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending}
                  className="h-12 px-8 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/25 transition-all duration-200 hover:shadow-pink-500/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {analyzeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      分析中...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      开始分析
                    </div>
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {analyzeMutation.isError && (
                <div className="mt-4 max-w-2xl mx-auto">
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-400 mb-1">
                          分析失败
                        </h4>
                        <p className="text-xs text-red-400/70 whitespace-pre-line">
                          {analyzeMutation.error?.message || "未知错误"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Example */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500 mb-2">支持格式：</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "v.douyin.com/xxxxx",
                    "整段分享文案粘贴",
                  ].map((example) => (
                    <span
                      key={example}
                      className="px-3 py-1 text-xs rounded-lg bg-slate-700/50 text-slate-400 border border-slate-600/30"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-400 mb-1">
                  使用方法
                </h3>
                <p className="text-xs text-amber-400/70 leading-relaxed">
                  在抖音APP中点击视频右下角「分享」→「复制链接」，然后直接粘贴到这里。
                  支持整段文案粘贴，系统会自动提取其中的链接。
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="space-y-6">
            {latestResult ? (
              <VideoAnalysisResult data={latestResult} />
            ) : (
              <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">
                  暂无分析结果
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  请先进入「视频解析」页面，输入抖音链接开始分析
                </p>
                <Button
                  onClick={() => setActiveTab("analyze")}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  前往解析
                </Button>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <AnalysisHistory
              history={history || []}
              onItemClick={handleHistoryClick}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Separator className="bg-slate-700/50" />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500">
        <p>抖音视频分析工具 - 数据仅供参考</p>
      </footer>
    </div>
  );
}
