interface KeypadProps {
  value: string;
  disabled: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Числова клавіатура: 0-9 + стерти, і окрема кнопка підтвердження. */
export default function Keypad({ value, disabled, onDigit, onBackspace, onSubmit }: KeypadProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {DIGITS.map((d) => (
          <button
            key={d}
            className="g-choice"
            disabled={disabled}
            onClick={() => onDigit(d)}
          >
            {d}
          </button>
        ))}
        <button
          className="g-choice"
          disabled={disabled || value === ''}
          aria-label="Стерти"
          onClick={onBackspace}
        >
          ⌫
        </button>
        <button className="g-choice" disabled={disabled} onClick={() => onDigit('0')}>
          0
        </button>
      </div>
      <button
        className="g-btn primary"
        style={{ marginTop: 14 }}
        disabled={disabled || value === ''}
        onClick={onSubmit}
      >
        Перевірити
      </button>
    </div>
  );
}
