import { mastra } from './mastra';

const question = process.argv[2];
if (!question) {
  console.error('用法: bun run src/ask.ts "你的問題" [thread 名稱]');
  process.exit(1);
}
const thread = process.argv[3] ?? 'cli:default';

const agent = mastra.getAgent('plannerAgent');
const result = await agent.generate(question, {
  memory: { resource: 'user:willy', thread },
});

console.log(result.text);
console.log('--- usage:', JSON.stringify(result.usage));