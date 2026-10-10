import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';

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
    <div className={context.globals.theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-40 bg-background p-5 text-foreground"><Story /></div>
    </div>
  )],
};
export default preview;
