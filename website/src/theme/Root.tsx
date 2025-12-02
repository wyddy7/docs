import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import FaviconSwitcher from '@site/src/components/FaviconSwitcher';

export default function Root({children}: {children: ReactNode}): ReactNode {
  useEffect(() => {
    // Яндекс.Метрика - оригинальный код адаптирован для TypeScript
    (function(m: any, e: Document, t: string, r: string, i: string, k: HTMLScriptElement | null, a: HTMLScriptElement | null){
      m[i] = m[i] || function(...args: any[]){
        (m[i].a = m[i].a || []).push(args);
      };
      m[i].l = 1 * new Date().getTime();
      
      // Проверка на дублирование скрипта
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) { 
          return; 
        }
      }
      
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      if (k && a) {
        k.async = 1;
        k.src = r;
        a.parentNode?.insertBefore(k, a);
      }
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=105616798', 'ym', null, null);

    // Инициализация Яндекс.Метрики
    // Используем очередь, если ym еще не загружен
    if (typeof (window as any).ym === 'function') {
      (window as any).ym(105616798, 'init', {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true
      });
    } else {
      // Если функция еще не доступна, она будет вызвана через очередь
      (window as any).ym = (window as any).ym || function(...args: any[]){
        ((window as any).ym.a = (window as any).ym.a || []).push(args);
      };
      (window as any).ym(105616798, 'init', {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true
      });
    }
  }, []);

  return (
    <>
      <FaviconSwitcher />
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/105616798" 
            style={{position: 'absolute', left: '-9999px'}} 
            alt="" 
          />
        </div>
      </noscript>
      {children}
    </>
  );
}

