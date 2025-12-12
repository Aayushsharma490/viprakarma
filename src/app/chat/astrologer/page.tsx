'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ChatWithAstrologerPage from './ChatWithAstrologerPage';

export default function ChatAstrologerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
    </div>}>
      <ChatWithAstrologerPage />
    </Suspense>
  );
}
