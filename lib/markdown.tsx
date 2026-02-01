import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt }) => {
            if (typeof src === 'string') {
              return (
                <img src={src} alt={alt || ''} className="w-full h-auto my-4 rounded-lg shadow-md" />
              );
            }
            return null;
          },
          h1: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : '';
            const id = generateHeadingId(text);
            return (
              <h1 id={id} className="text-3xl font-bold mt-8 mb-4 scroll-mt-20" {...props}>
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : '';
            const id = generateHeadingId(text);
            return (
              <h2 id={id} className="text-2xl font-bold mt-6 mb-3 scroll-mt-20" {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : '';
            const id = generateHeadingId(text);
            return (
              <h3 id={id} className="text-xl font-semibold mt-5 mb-2 scroll-mt-20" {...props}>
                {children}
              </h3>
            );
          },
          h4: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : '';
            const id = generateHeadingId(text);
            return (
              <h4 id={id} className="text-lg font-semibold mt-4 mb-2 scroll-mt-20" {...props}>
                {children}
              </h4>
            );
          },
          h5: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : '';
            const id = generateHeadingId(text);
            return (
              <h5 id={id} className="text-base font-medium mt-3 mb-2 scroll-mt-20" {...props}>
                {children}
              </h5>
            );
          },
          h6: ({ children, ...props }) => {
            const text = typeof children === 'string' ? children : '';
            const id = generateHeadingId(text);
            return (
              <h6 id={id} className="text-sm font-medium mt-3 mb-2 scroll-mt-20" {...props}>
                {children}
              </h6>
            );
          },
          a: ({ href, children, ...props }) => {
            const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
            if (isExternal) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-blue-600/30 hover:decoration-blue-800 transition-colors"
                  {...props}
                >
                  {children}
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              );
            }
            return (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-4 decoration-blue-600/30 hover:decoration-blue-800 transition-colors"
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-lg my-4"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
