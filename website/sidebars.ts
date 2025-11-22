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
    {
      type: 'category',
      label: 'Периферийные устройства',
      items: [
        'peripheral-devices/lab1',
        'peripheral-devices/lab2',
        'peripheral-devices/lab3',
        'peripheral-devices/lab4',
      ],
    },
    {
      type: 'category',
      label: 'Организация ЭВМ',
      items: [
        'computer-organization/lab7',
        'computer-organization/lab8',
      ],
    },
    {
      type: 'category',
      label: 'Курсовая работа',
      items: [
        'course-work/rp-op-design',
        'course-work/arithmetic-device',
      ],
    },
  ],
};

export default sidebars;
