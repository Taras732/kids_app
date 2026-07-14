import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid } from '../shared/ui';
import { generate, type Payload } from './generate';

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { emoji, kind, options } = round.payload;
  const question = kind === 'season' ? 'Яка це пора року?' : 'Яка зараз погода?';
  const choices = options.map((value) => ({ value }));

  return (
    <>
      <PromptCard question={question} answerState={answerState}>
        <div style={{ fontSize: 96, textAlign: 'center', margin: '8px auto' }}>{emoji}</div>
      </PromptCard>
      <ChoiceGrid
        options={choices}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
      />
    </>
  );
}

const seasonsWeather: GameDefinition<Payload, string> = {
  id: 'seasons-weather',
  title: 'Пори року й погода',
  subject: 'science',
  levels: ['L0'],
  icon: '🍂',
  description: 'Впізнай пору року та погоду.',
  accent: '#FFEDD5',
  // TODO: мапінг на ЯДС skills коли зʼявляться
  generate,
  Component,
};

export default seasonsWeather;
