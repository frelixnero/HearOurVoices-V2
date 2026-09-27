import { describe, it, expect } from 'vitest';
import { screenStory } from '@/lib/stories/safety';

describe('Story safety screen (Safe & Moderated)', () => {
  it('publishes an ordinary story', () => {
    const r = screenStory('I finally spoke up at work and it helped me heal.');
    expect(r.decision).toBe('publish');
    expect(r.crisis).toBe(false);
  });

  it('holds a directed threat for review', () => {
    expect(screenStory('I will kill you and your family').decision).toBe('review');
  });

  it('holds likely doxxing (SSN / home address) for review', () => {
    expect(screenStory('his number is 123-45-6789').decision).toBe('review');
    expect(screenStory('she lives at 42 Oak Street').decision).toBe('review');
  });

  it('flags an author-in-crisis post but still allows publishing', () => {
    const r = screenStory('Some days I just want to die and end my life.');
    expect(r.crisis).toBe(true);
    expect(r.decision).toBe('publish'); // never blocked — support is offered
  });
});
