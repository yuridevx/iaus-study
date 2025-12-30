import type { ReactNode } from 'react';
import { TabNav } from './TabNav';

interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <TabNav />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
