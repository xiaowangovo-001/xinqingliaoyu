export function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: '说出你的感受',
      description: '不需要华丽的措辞。你可以写"今天有点糟糕"，也可以写一长段——知心都能接住。',
      emoji: '💬',
    },
    {
      step: '2',
      title: '深层分析',
      description: '知心不只识别表面的焦虑或悲伤，它会尝试理解你的核心情绪和真实需求。',
      emoji: '🧠',
    },
    {
      step: '3',
      title: '有温度的回应',
      description: '不只空泛安慰。知心会调用你的历史记忆，给出具体、可行动的建议。',
      emoji: '💌',
    },
    {
      step: '4',
      title: '追踪成长',
      description: '每一次对话都被温柔记录。回头看，你会看到自己已经走了多远。',
      emoji: '🌱',
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-[var(--foreground)]">
            它是如何工作的
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            一次对话，四个步骤
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent)] flex items-center justify-center text-2xl mb-4">
                {s.emoji}
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--warm)]/10 text-[var(--warm)] text-xs font-medium mb-2">
                第{s.step}步
              </div>
              <h3 className="font-medium text-[var(--foreground)] mt-2">{s.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
