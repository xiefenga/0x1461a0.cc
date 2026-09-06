/**
 * Rehype 插件：为代码块添加包装容器、语言标签和复制按钮
 * 生成结构：
 * <div class="code-block-wrapper">
 *   <span class="code-block-lang">xxx</span>
 *   <button class="code-block-copy">
 *     <svg class="code-block-copy-icon">...</svg>
 *     <svg class="code-block-check-icon">...</svg>
 *   </button>
 *   <pre>
 *     <code>...</code>
 *   </pre>
 * </div>
 */
import { visit } from "unist-util-visit";

import type { Root, Element } from "hast";

const isElement = (node: unknown): node is Element => {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Element).type === "element"
  );
};

// 复制图标 SVG
const copyIconSvg: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    className: ["code-block-copy-icon"],
    ariaHidden: "true",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  children: [
    {
      type: "element",
      tagName: "rect",
      properties: {
        x: "9",
        y: "9",
        width: "13",
        height: "13",
        rx: "2",
        ry: "2",
      },
      children: [],
    },
    {
      type: "element",
      tagName: "path",
      properties: {
        d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
      },
      children: [],
    },
  ],
};

// 勾选图标 SVG
const checkIconSvg: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    className: ["code-block-check-icon"],
    ariaHidden: "true",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  children: [
    {
      type: "element",
      tagName: "polyline",
      properties: { points: "20 6 9 17 4 12" },
      children: [],
    },
  ],
};

// 深拷贝元素（避免共享引用）
const cloneElement = (el: Element): Element =>
  JSON.parse(JSON.stringify(el)) as Element;

export const rehypeCodeBlock = () => {
  return (tree: Root) => {
    // 用容器包裹 pre，并添加语言标签和复制按钮。
    visit(tree, "element", (node, index, parent) => {
      const firstChild = node.children?.[0];
      // 找到 pre > code 结构（Shiki 处理后 pre 的第一个元素子节点是 code）
      if (
        node.tagName === "pre" &&
        isElement(firstChild) &&
        firstChild.tagName === "code" &&
        index !== undefined &&
        parent
      ) {
        node.properties = node.properties || {};

        // 获取语言
        const language = (node.properties.dataLanguage as string) || "text";

        // 创建语言标签元素
        const langLabel: Element = {
          type: "element",
          tagName: "span",
          properties: {
            className: ["code-block-lang"],
          },
          children: [{ type: "text", value: language }],
        };

        // 创建复制按钮
        const copyBtn: Element = {
          type: "element",
          tagName: "button",
          properties: {
            className: ["code-block-copy"],
            type: "button",
            ariaLabel: "复制代码",
            title: "复制代码",
          },
          children: [cloneElement(copyIconSvg), cloneElement(checkIconSvg)],
        };

        // 创建包装容器
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: {
            className: ["code-block-wrapper"],
          },
          children: [langLabel, copyBtn, node],
        };

        // 替换原来的 pre 元素
        parent.children[index] = wrapper;
      }
    });
  };
};

export default rehypeCodeBlock;
