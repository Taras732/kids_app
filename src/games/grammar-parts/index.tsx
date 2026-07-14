import type { ReactNode } from 'react';
import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid } from '../shared/ui';
import { generate, type Payload, type Pos } from './generate';

/** Речення з виділеним (кольором+жирним) цільовим словом. */
function renderSentence(sentence: string, target: string): ReactNode {
  const idx = sentence.indexOf(target);
  if (idx === -1) return sentence;
  const before = sentence.slice(0, idx);
  const after = sentence.slice(idx + target.length);
  return (
    <>
      {before}
      <span style={{ color: 'var(--c-primary)', fontWeight: 900 }}>{target}</span>
      {after}
    </>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, Pos>) {
  const { sentence, target, options } = round.payload;
  const choices = options.map((o) => ({ value: o }));

  return (
    <>
      <PromptCard question={`Яка частина мови слово «${target}»?`} answerState={answerState}>
        <div
          style={{
            fontSize: 21,
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: 1.5,
            margin: '8px auto',
            maxWidth: 340,
          }}
        >
          {renderSentence(sentence, target)}
        </div>
      </PromptCard>
      <ChoiceGrid
        options={choices}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={3}
      />
    </>
  );
}

const grammarParts: GameDefinition<Payload, Pos> = {
  id: 'grammar-parts',
  title: 'Частини мови',
  subject: 'language',
  levels: ['L3'],
  icon: '📝',
  description: 'Визнач іменник, дієслово чи прикметник у реченні.',
  accent: '#E0E7FF',
  // TODO: мапінг на мовні skills коли зʼявляться
  generate,
  Component,
};

export default grammarParts;
