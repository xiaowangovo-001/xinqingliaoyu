'use client';

import { Card } from '@/components/ui/Card';

const wisemen = [
  {
    name: '苏轼 · 东坡居士',
    subtitle: '豁达模式',
    emoji: '🍃',
    color: 'from-amber-50 to-orange-50',
    description:
      '"人生如逆旅，我亦是行人。"\n苏轼一生三度被贬，却在黄州发明了东坡肉，在惠州日啖荔枝三百颗，在儋州办学授徒。他的豁达不是不在乎——是经历过大风大浪之后，依然选择幽默以对。',
    scenario: '适合：遭遇挫折、感到委屈、需要一双更大的眼睛看世界时',
    sampleQuote: '"你此刻觉得过不去的，三年后回头看，不过是一蓑烟雨罢了。"',
  },
  {
    name: '王阳明 · 阳明先生',
    subtitle: '内省模式',
    emoji: '🌄',
    color: 'from-slate-50 to-blue-50',
    description:
      '"知而不行，只是未知。"\n王阳明龙场悟道，提出"心即理""知行合一""致良知"。他不教你向外寻找答案，而是引导你回到内心——你本就知道该做什么，只是需要有人帮你听见那个声音。',
    scenario: '适合：知行脱节、知道但做不到、在众多选择中迷失方向时',
    sampleQuote: '"破山中贼易，破心中贼难。你且告诉我——你不动，是惧，是惰，还是疑？"',
  },
  {
    name: '苏格拉底',
    subtitle: '诘问模式',
    emoji: '🏛️',
    color: 'from-stone-50 to-gray-50',
    description:
      '"我唯一知道的，就是我一无所知。"\n苏格拉底从不给答案。他只问问题——一个接一个，直到你自己看清思维的矛盾和隐藏的假设。他不是在为难你，是在帮你"审视"自己的人生。',
    scenario: '适合：想不通一个道理、对某个信念产生怀疑、需要厘清思路时',
    sampleQuote: '"你说你想成功——但请告诉我：你所追求的"成功"，是你自己定义的，还是别人放在你脑中的？"',
  },
];

export function WisemanShowcase() {
  return (
    <section className="py-24 px-4 bg-[var(--muted)]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">
            当你需要另一种声音
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            切换一位智者，换一个看待问题的角度
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wisemen.map((w) => (
            <Card key={w.name} className="relative overflow-hidden" padding="none">
              <div className={`bg-gradient-to-b ${w.color} p-6`}>
                <span className="text-4xl">{w.emoji}</span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                  {w.name}
                </h3>
                <p className="text-sm text-[var(--warm)] font-medium mt-0.5">
                  {w.subtitle}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
                  {w.description}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] italic">
                  {w.scenario}
                </p>
                <blockquote className="border-l-2 border-[var(--warm)] pl-4 text-sm text-[var(--foreground)] italic">
                  {w.sampleQuote}
                </blockquote>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
