import React, { useState, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Stage } from '../types/nutrition';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.stages.map(stage => (
          <Card key={stage.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={`stage-${stage.id}`} className="font-medium">
                  {stage.name}
                </Label>
                <Badge variant="outline">{stage.duration} min</Badge>
              </div>
              <div className="space-y-2">
                <Input
                  id={`stage-${stage.id}`}
                  type="text"
                  value={inputs[stage.id]}
                  onChange={e => handleInputChange(stage, e.target.value)}
                  onBlur={e => handleInputBlur(stage, e.target.value)}
                  placeholder="h:mm or mm"
                  className="w-full"
                  pattern="^\d{0,2}:?\d{0,2}$"
                  title="Enter as h:mm or mm"
                />
                <p className="text-xs text-muted-foreground">Format: h:mm (e.g., 1:30) or mm (e.g., 90)</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Total Race Time</div>
              <div className="text-sm text-muted-foreground">
                {formatTime(totalMinutes)} ({totalMinutes} minutes)
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RaceStages;
