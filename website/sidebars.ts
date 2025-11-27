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
        'peripheral-devices/lab-keyboard-ps2',
        'peripheral-devices/lab-mouse-ps2',
        'peripheral-devices/lab-audio',
        'peripheral-devices/lab-vga',
      ],
    },
    {
      type: 'category',
      label: 'Организация ЭВМ',
      items: [
        {
          type: 'category',
          label: 'Дополнительные лабы',
          items: [
            'computer-organization/additional-labs/lab1-emulator-debug',
            'computer-organization/additional-labs/lab2-protected-mode',
            'computer-organization/additional-labs/lab3-interrupts-exceptions',
            'computer-organization/additional-labs/lab4-paging',
          ],
        },
        'computer-organization/lab-manual-sem6',
        {
          type: 'category',
          label: 'Лабораторные работы (7 семестр)',
          items: [
            'computer-organization/labs-sem7/lab6',
            'computer-organization/labs-sem7/lab7',
            'computer-organization/labs-sem7/lab8',
          ],
        },
        {
          type: 'category',
          label: 'Теория',
          items: [
            'computer-organization/theory/jtag-theory',
            'computer-organization/theory/jtag-uart-port',
          ],
        },
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
