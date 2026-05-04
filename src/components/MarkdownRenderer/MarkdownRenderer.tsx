import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// 代码高亮样式（内联，避免导入 CSS 文件的问题）
const highlightStyles = `
.hljs {
  display: block;
  overflow-x: auto;
  padding: 0.5em;
  color: #24292e;
  background: #f6f8fa;
}
.hljs-comment,
.hljs-punctuation {
  color: #6a737d;
}
.hljs-string,
.hljs-attr {
  color: #032f62;
}
.hljs-number,
.hljs-literal {
  color: #005cc5;
}
.hljs-keyword,
.hljs-selector-tag,
.hljs-subst {
  color: #d73a49;
}
.hljs-function {
  color: #6f42c1;
}
.hljs-variable,
.hljs-template-variable {
  color: #e36209;
}
.hljs-title,
.hljs-class .hljs-title,
.hljs-section {
  color: #6f42c1;
}
`;

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <>
      <style>{highlightStyles}</style>
      <div className={`markdown-body ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // 自定义代码块渲染
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && (props as { inline?: boolean }).inline;
              return isInline ? (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            // 自定义段落渲染
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            // 自定义列表渲染
            ul({ children }) {
              return <ul className="list-disc pl-5 mb-2">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal pl-5 mb-2">{children}</ol>;
            },
            li({ children }) {
              return <li className="mb-1">{children}</li>;
            },
            // 自定义标题渲染
            h1({ children }) {
              return <h1 className="text-xl font-bold mb-2">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-lg font-bold mb-2">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-base font-bold mb-2">{children}</h3>;
            },
            // 自定义链接渲染
            a({ children, href }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {children}
                </a>
              );
            },
            // 自定义表格渲染
            table({ children }) {
              return (
                <table className="border-collapse border border-gray-300 my-2">{children}</table>
              );
            },
            th({ children }) {
              return (
                <th className="border border-gray-300 px-3 py-1 bg-gray-100 font-semibold">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return <td className="border border-gray-300 px-3 py-1">{children}</td>;
            },
            // 自定义引用块渲染
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">
                  {children}
                </blockquote>
              );
            },
            // 自定义分割线渲染
            hr() {
              return <hr className="my-3 border-gray-300" />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
}
