import { motion } from "framer-motion";
import Markdown from "marked-react";
import { CodeBlock } from "@/components/chat/codeblock";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowUpRight, Link } from "@phosphor-icons/react";
import React, { ReactNode, useState, useMemo } from "react";

export const REVEAL_ANIMATION_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut", delay: 0.1 },
  },
};

export type TLink = {
  href: string;
  text: ReactNode;
};

export const useMarkdown = () => {
  const [links, setLinks] = useState<TLink[]>([]);

  const renderMarkdown = (
    message: string,
    animate: boolean,
    messageId?: string
  ) => {
    // 使用唯一ID前缀，确保每个元素都有唯一key
    const uniquePrefix = useMemo(
      () => `md-${messageId || Math.random().toString(36).substring(2, 11)}-`,
      [messageId]
    );
    let elementCounter = 0;

    return (
      <Markdown
        key={`markdown-${messageId || "default"}`}
        renderer={{
          text: (children) => {
            const key = `${uniquePrefix}text-${elementCounter++}`;
            return (
              <motion.span
                key={key}
                variants={REVEAL_ANIMATION_VARIANTS}
                animate={"visible"}
                initial={animate ? "hidden" : "visible"}
              >
                {children}
              </motion.span>
            );
          },
          table: (children) => {
            const key = `${uniquePrefix}table-${elementCounter++}`;
            return (
              <div
                key={key}
                className="overflow-x-auto my-3 border border-zinc-100 rounded-xl dark:border-white/10"
              >
                <table className="w-full overflow-hidden text-sm md:text-base text-left rtl:text-right text-gray-600 dark:text-gray-200">
                  {children}
                </table>
              </div>
            );
          },
          tableHeader(children) {
            const key = `${uniquePrefix}thead-${elementCounter++}`;
            return (
              <thead
                key={key}
                className="text-sm md:text-base w-full font-medium text-zinc-800 uppercase bg-zinc-50 dark:bg-white/10 dark:text-white/20"
              >
                {children}
              </thead>
            );
          },
          tableRow(children) {
            const key = `${uniquePrefix}tr-${elementCounter++}`;
            return (
              <tr key={key} className="hover:bg-zinc-50 dark:bg-white/5">
                {children}
              </tr>
            );
          },
          tableCell(children, flags) {
            const key = `${uniquePrefix}td-${elementCounter++}`;
            if (flags.header) {
              return (
                <th key={key} className="p-3 text-sm md:text-base">
                  {children}
                </th>
              );
            }
            return (
              <td key={key} className="p-3 text-sm md:text-base">
                {children}
              </td>
            );
          },
          tableBody: (children) => {
            const key = `${uniquePrefix}tbody-${elementCounter++}`;
            return <tbody key={key}>{children}</tbody>;
          },
          paragraph: (children) => {
            const key = `${uniquePrefix}p-${elementCounter++}`;
            return <p key={key}>{children}</p>;
          },
          em: (children) => {
            const key = `${uniquePrefix}em-${elementCounter++}`;
            return <em key={key}>{children}</em>;
          },
          heading: (children, level) => {
            const key = `${uniquePrefix}h${level}-${elementCounter++}`;
            const Heading = `h${level}` as any;
            return <Heading key={key}>{children}</Heading>;
          },
          link: (href, text) => {
            const key = `${uniquePrefix}a-${href}-${elementCounter++}`;
            if (text && href) {
              return (
                <HoverCard key={key}>
                  <HoverCardTrigger>
                    <a href={href} data-message-id={messageId}>
                      {text}
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent
                    sideOffset={12}
                    className="p-3 rounded-xl flex max-w-[500px] flex-col items-start bg-zinc-700 hover:bg-zinc-800 cursor-pointer"
                    onClick={() => {
                      window.open(href, "_blank");
                    }}
                  >
                    <p className="flex flex-row font-normal text-xs items-center gap-2 text-zinc-200 dark:text-zinc-200 leading-7 w-full whitespace-pre-wrap overflow-hidden">
                      <Link
                        size={16}
                        weight="bold"
                        className="text-white flex-shrink-0"
                      />
                      {href}
                      <ArrowUpRight
                        size={16}
                        weight="bold"
                        className="text-white flex-shrink-0"
                      />
                    </p>
                  </HoverCardContent>
                </HoverCard>
              );
            }
            return <></>;
          },
          blockquote: (children) => {
            const key = `${uniquePrefix}blockquote-${elementCounter++}`;
            return (
              <blockquote key={key}>
                <div>{children}</div>
              </blockquote>
            );
          },
          listItem: (children) => {
            const key = `${uniquePrefix}li-${elementCounter++}`;
            // 需要返回一个ReactElement
            return <span key={key}>{children}</span>;
          },
          list: (children, ordered) => {
            const key = `${uniquePrefix}list-${
              ordered ? "ol" : "ul"
            }-${elementCounter++}`;

            // 直接构建列表，一步包装li元素
            const items = React.Children.map(children, (child, i) => {
              // 确保每个子元素有唯一的key
              return <li key={`${key}-item-${i}`}>{child}</li>;
            });

            return ordered ? (
              <ol key={key} className="list-decimal pl-6 my-2">
                {items}
              </ol>
            ) : (
              <ul key={key} className="list-disc pl-6 my-2">
                {items}
              </ul>
            );
          },
          strong: (children) => {
            const key = `${uniquePrefix}strong-${elementCounter++}`;
            return <strong key={key}>{children}</strong>;
          },
          hr: () => {
            const key = `${uniquePrefix}hr-${elementCounter++}`;
            return (
              <hr
                key={key}
                className="my-4 border-gray-100 dark:border-white/10"
              />
            );
          },
          code: (code, lang) => {
            const key = `${uniquePrefix}code-${elementCounter++}`;
            return (
              <div key={key} className="my-4 w-full flex-shrink-0 not-prose">
                <CodeBlock lang={lang} code={code?.toString()} />
              </div>
            );
          },
          image: (src, alt, title) => <></>, // 禁用图片，返回空的React Fragment
          br: () => {
            const key = `${uniquePrefix}br-${elementCounter++}`;
            return <br key={key} />;
          },
          codespan: (code) => {
            const key = `${uniquePrefix}codespan-${elementCounter++}-${
              typeof code === "string" ? code.substring(0, 10) : ""
            }`;
            return (
              <span
                key={key}
                className="px-2 py-1 text-sm md:text-base rounded-md dark:text-white bg-zinc-50 text-zinc-800 dark:bg-white/10 font-medium"
              >
                {code}
              </span>
            );
          },
        }}
      >
        {message}
      </Markdown>
    );
  };

  return { renderMarkdown, links };
};
