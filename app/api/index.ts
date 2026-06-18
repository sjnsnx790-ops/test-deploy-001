// Vercel Serverless Function 入口
// Vercel 自动检测 api/ 目录下的文件作为 Serverless Functions
import app from "./boot";

// Hono app 本身符合 Web Standard 的 Request/Response API
// 直接导出 fetch handler 给 Vercel
export default app.fetch.bind(app);

// Vercel 配置
export const config = {
  runtime: "nodejs18.x",
};
