/**
 * Remark 插件：修复链接文本中的 HTML 标签被误解析的问题
 * 例如: [你真的会用<a>标签下载文件吗?](url) 中的 <a> 会被解析为 HTML 节点
 * 该插件会将链接内的 html 节点转换回 text 节点
 */
import { visit } from "unist-util-visit";

import type { Root, Link, PhrasingContent, Text, Html } from "mdast";

export const remarkSanitizeLinkHtml = () => {
  return (tree: Root) => {
    visit(tree, "link", (node: Link) => {
      if (node.children) {
        node.children = node.children.map((child): PhrasingContent => {
          // 将链接内的 html 节点转换为 text 节点
          if (child.type === "html") {
            return {
              type: "text",
              value: (child as Html).value,
            } as Text;
          }
          return child;
        });
      }
    });
  };
};

export default remarkSanitizeLinkHtml;
