import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

/** 文章正文渲染：markdown（GFM：表格/删除线等）+ 代码高亮，排版样式由 globals.css 的 prose 覆盖提供 */
export default function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
