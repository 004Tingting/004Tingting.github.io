import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

/**
 * 文章正文渲染：markdown（GFM 表格 + KaTeX 公式 $…$ / $$…$$）+ 代码高亮。
 * 排版样式由 globals.css 的 prose 覆盖提供；className 用于研思正文的
 * Times New Roman 西文字体约定（见 ArticleDetail）。
 */
export default function MarkdownBody({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={`prose prose-neutral max-w-none ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
