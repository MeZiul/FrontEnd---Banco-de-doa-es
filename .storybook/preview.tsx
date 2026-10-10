import type { Preview } from '@storybook/nextjs-vite';
import { useEffect, type ReactNode } from 'react';
import '../app/globals.css';

function ThemeFrame({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => {
    const hadDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    return () => { document.documentElement.classList.toggle('dark', hadDark); };
  }, [theme]);
  return <div className="min-h-40 bg-background p-5 text-foreground">{children}</div>;
}

const preview: Preview = {
  globalTypes: {
    theme: { description: 'Tema', toolbar: { icon: 'circlehollow', items: ['light', 'dark'] } },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'padded',
    a11y: { test: 'todo' },
    viewport: {
      options: {
        mobile: { name: 'Celular 390px', styles: { width: '390px', height: '844px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '1000px' } },
      },
    },
  },
  decorators: [(Story, context) => (
    <ThemeFrame theme={context.globals.theme === 'dark' ? 'dark' : 'light'}><Story /></ThemeFrame>
  )],
};
export default preview;
