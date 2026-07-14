import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '知心 — AI情绪陪伴工具',
  description:
    '一个记得你、理解你、还能请来苏轼陪你聊天的AI情绪陪伴工具。基于心理学与人文学科洞察，帮助你探索内心、追踪成长。',
  keywords: ['情绪陪伴', 'AI对话', '心理健康', '自我成长', '苏轼', '王阳明', '苏格拉底'],
  openGraph: {
    title: '知心 — AI情绪陪伴工具',
    description: '一个记得你、理解你、还能请来千年智者陪你聊天的AI情绪陪伴工具',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
