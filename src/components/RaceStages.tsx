import React, { useState, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Stage } from '../types/nutrition';

function pad(num: number): string {
  return num.toString().padStart(2, '0');
}

function parseTime(str: string): number {
  // Accepts 'h:mm' or 'mm' format
  const [h, m] = str.includes(':') ? str.split(':') : ['0', str];
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${pad(m)}`;
}

const RaceStages: React.FC = () => {
  const { state, dispatch } = useNutrition();
  // Local state for each stage's input
  const [inputs, setInputs] = useState<Record<number, string>>(() => {
    const obj: Record<number, string> = {};
    state.stages.forEach(stage => {
      obj[stage.id] = formatTime(stage.duration);
    });
    return obj;
  });

  // Keep local input in sync if stages change
  useEffect(() => {
    setInputs(prev => {
      const next = { ...prev };
      state.stages.forEach(stage => {
        if (!(stage.id in next)) {
          next[stage.id] = formatTime(stage.duration);
        }
      });
      return next;
    });
  }, [state.stages]);

  const handleInputChange = (stage: Stage, value: string): void => {
    setInputs(inputs => ({ ...inputs, [stage.id]: value }));
    // Only update context if valid
    const valid = /^\d{1,2}(:\d{1,2})?$/.test(value);
    if (valid) {
      let mins = 0;
      try {
        mins = parseTime(value);
      } catch {
        mins = 0;
      }
      dispatch({ type: 'UPDATE_STAGE', stage: { ...stage, duration: mins } });
    }
  };

  const handleInputBlur = (stage: Stage, value: string): void => {
    // Reset to last valid value if input is invalid
    const valid = /^\d{1,2}(:\d{1,2})?$/.test(value);
    if (!valid) {
      setInputs(inputs => ({
        ...inputs,
        [stage.id]: formatTime(stage.duration),
      }));
    }
  };

  const totalMinutes = state.stages.reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <section>
      <h2>Race Stages</h2>
      <ul>
        {state.stages.map(stage => (
          <li key={stage.id}>
            {stage.name} Duration:
            <input
              type="text"
              value={inputs[stage.id]}
              onChange={e => handleInputChange(stage, e.target.value)}
              onBlur={e => handleInputBlur(stage, e.target.value)}
              size={5}
              pattern="^\d{0,2}:?\d{0,2}$"
              title="Enter as h:mm or mm"
              style={{ width: 60, marginLeft: 8, marginRight: 8 }}
            />
            (minutes: {stage.duration})
          </li>
        ))}
      </ul>
      <div>
        <strong>Total Race Time:</strong> {formatTime(totalMinutes)} ({totalMinutes} min)
      </div>
    </section>
  );
};

export default RaceStages;
