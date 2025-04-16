import { motion } from "framer-motion";
import Markdown from "marked-react";
import { CodeBlock } from "@/components/chat/codeblock";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowUpRight, Link } from "@phosphor-icons/react";
import React, { ReactNode, useState } from "react";

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
  ) => (
    <Markdown
      renderer={{
        text: (children) => (
          <motion.span
            key={crypto.randomUUID()}
            variants={REVEAL_ANIMATION_VARIANTS}
            animate={"visible"}
            initial={animate ? "hidden" : "visible"}
          >
            {children}
          </motion.span>
        ),
        table: (children) => (
          <div
            key={crypto.randomUUID()}
            className="overflow-x-auto my-3 border border-zinc-100 rounded-xl dark:border-white/10"
          >
            <table className="w-full overflow-hidden text-sm md:text-base text-left rtl:text-right text-gray-600 dark:text-gray-200">
              {children}
            </table>
          </div>
        ),
        tableHeader(children) {
          return (
            <thead
              key={crypto.randomUUID()}
              className="text-sm md:text-base w-full font-medium text-zinc-800 uppercase bg-zinc-50 dark:bg-white/10 dark:text-white/20"
            >
              {children}
            </thead>
          );
        },
        tableRow(children) {
          return (
            <tr
              key={crypto.randomUUID()}
              className="hover:bg-zinc-50 dark:bg-white/5"
            >
              {children}
            </tr>
          );
        },
        tableCell(children, flags) {
          if (flags.header) {
            return (
              <th
                key={crypto.randomUUID()}
                className="p-3 text-sm md:text-base"
              >
                {children}
              </th>
            );
          }
          return (
            <td key={crypto.randomUUID()} className="p-3 text-sm md:text-base">
              {children}
            </td>
          );
        },
        tableBody: (children) => (
          <tbody key={crypto.randomUUID()}>{children}</tbody>
        ),
        paragraph: (children) => <p key={crypto.randomUUID()}>{children}</p>,
        em: (children) => <em key={crypto.randomUUID()}>{children}</em>,
        heading: (children, level) => {
          const Heading = `h${level}` as any;
          return <Heading key={crypto.randomUUID()}>{children}</Heading>;
        },
        link: (href, text) => {
          if (text && href) {
            return (
              <HoverCard key={href}>
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
        blockquote: (children) => (
          <blockquote key={crypto.randomUUID()}>
            <p>{children}</p>
          </blockquote>
        ),
        list: (children, ordered) =>
          ordered ? (
            <ol key={crypto.randomUUID()}>
              {React.Children.map(children, (child, i) => (
                <li key={i}>{child}</li>
              ))}
            </ol>
          ) : (
            <ul key={crypto.randomUUID()}>
              {React.Children.map(children, (child, i) => (
                <li key={i}>{child}</li>
              ))}
            </ul>
          ),
        listItem: (children) => <p key={crypto.randomUUID()}>{children}</p>,
        strong: (children) => (
          <strong key={crypto.randomUUID()}>{children}</strong>
        ),
        hr: () => (
          <hr
            key={crypto.randomUUID()}
            className="my-4 border-gray-100 dark:border-white/10"
          />
        ),
        code: (code, lang) => (
          <div
            key={crypto.randomUUID()}
            className="my-4 w-full flex-shrink-0 not-prose"
          >
            <CodeBlock lang={lang} code={code?.toString()} />
          </div>
        ),
        image: () => <></>, // 禁用图片
        br: () => <br key={crypto.randomUUID()} />,
        codespan: (code) => (
          <span
            key={messageId + "-codespan-" + code}
            className="px-2 py-1 text-sm md:text-base rounded-md dark:text-white bg-zinc-50 text-zinc-800 dark:bg-white/10 font-medium"
          >
            {code}
          </span>
        ),
      }}
    >
      {message}
    </Markdown>
  );

  return { renderMarkdown, links };
};
