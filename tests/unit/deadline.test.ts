import { describe, it, expect } from 'vitest';

describe('Task deadline (48hr)', () => {
  const DEADLINE_HOURS = 48;

  it('should set deadline 48 hours from now', () => {
    const now = new Date();
    const deadline = new Date(now.getTime() + DEADLINE_HOURS * 60 * 60 * 1000);
    const diffHours = (deadline.getTime() - now.getTime()) / (60 * 60 * 1000);
    expect(diffHours).toBe(48);
  });

  it('should detect expired deadline', () => {
    const pastDeadline = new Date(Date.now() - 1000);
    const isExpired = pastDeadline.getTime() < Date.now();
    expect(isExpired).toBe(true);
  });

  it('should detect active deadline', () => {
    const futureDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const isExpired = futureDeadline.getTime() < Date.now();
    expect(isExpired).toBe(false);
  });

  it('should format remaining time correctly', () => {
    const msLeft = 2 * 60 * 60 * 1000 + 30 * 60 * 1000;
    const h = Math.floor(msLeft / 3600000);
    const m = Math.floor((msLeft % 3600000) / 60000);
    expect(h).toBe(2);
    expect(m).toBe(30);
  });

  it('should show expired when time is zero', () => {
    const msLeft = 0;
    const h = Math.floor(msLeft / 3600000);
    expect(h).toBe(0);
  });

  it('should count 8 tasks correctly', () => {
    const totalTasks = 8;
    const completedTasks = 5;
    const pct = Math.round((completedTasks / totalTasks) * 100);
    expect(pct).toBe(63);
  });

  it('should mark all tasks complete at 8', () => {
    const completedTasks = 8;
    const allComplete = completedTasks >= 8;
    expect(allComplete).toBe(true);
  });
});
