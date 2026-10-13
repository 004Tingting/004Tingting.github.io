import { CLARITY } from "@/lib/site";

/**
 * 访客统计埋点（Microsoft Clarity）。
 * 站点上不呈现任何可见元素，数据只在 Clarity 后台可见。
 * projectId 未配置时静默不输出，便于本地开发与「尚未接入」状态。
 */
export default function Analytics() {
  if (!CLARITY.enabled || !CLARITY.projectId) return null;

  const snippet = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY.projectId}");`;

  return <script dangerouslySetInnerHTML={{ __html: snippet }} />;
}
