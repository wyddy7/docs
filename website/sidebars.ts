import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 * - create an ordered group of docs
 * - render a sidebar for each doc of that group
 * - provide next/previous navigation
 *
 * The sidebars can be generated from the filesystem, or explicitly defined here.
 *
 * Create as many sidebars as you want.
 */

const sidebars: SidebarsConfig = {
  // Структура боковой панели для лабораторных работ
  labsSidebar: [
    'intro',
    // Здесь будут добавляться лабораторные работы
    // 'lab1',
    // 'lab2',
    // и т.д.
  ],
};

export default sidebars;

