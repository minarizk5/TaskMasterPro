import { FC, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

const Markdown: FC<MarkdownProps> = ({ content, className }) => {
  const [markdownContent, setMarkdownContent] = useState(content);

  useEffect(() => {
    setMarkdownContent(content);
  }, [content]);

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-3 mb-1" {...props} />
          ),
          p: ({ node, ...props }) => <p className="my-2" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-sm my-3" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic text-gray-700 dark:text-gray-300 my-3"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="border-gray-300 dark:border-gray-600 my-4" {...props} />
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
