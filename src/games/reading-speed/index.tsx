import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid } from '../shared/ui';
import { generate, type Payload } from './generate';

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { mode, text, question, options } = round.payload;
  const promptQuestion = mode === 'word' ? 'Прочитай і обери слово' : question;
  const choices = options.map((o) => ({
    value: o,
    node: <span style={{ fontSize: 18, fontWeight: 700 }}>{o}</span>,
  }));

  return (
    <>
      <PromptCard question={promptQuestion} answerState={answerState}>
        <div
          style={{
            fontSize: mode === 'word' ? 40 : 22,
            fontWeight: 800,
            color: 'var(--c-primary)',
            textAlign: 'center',
            lineHeight: 1.4,
            margin: '8px auto',
            maxWidth: 320,
          }}
        >
          {text}
        </div>
      </PromptCard>
      <ChoiceGrid
        options={choices}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={choices.length === 3 ? 3 : 2}
      />
    </>
  );
}

const readingSpeed: GameDefinition<Payload, string> = {
  id: 'reading-speed',
  title: 'Швидке читання',
  subject: 'language',
  levels: ['L3'],
  icon: '👀',
  description: 'Читай уважно і швидко: слово чи речення — і дай відповідь.',
  accent: '#EEEBFF',
  // TODO: мапінг на мовні skills коли зʼявляться
  generate,
  Component,
};

export default readingSpeed;
