import { ReactionType } from '@org/ghreactions-github/models';

export const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: ReactionType.ThumbsUp, emoji: '👍' },
  { type: ReactionType.ThumbsDown, emoji: '👎' },
  { type: ReactionType.Laugh, emoji: '😄' },
  { type: ReactionType.Hooray, emoji: '🎉' },
  { type: ReactionType.Confused, emoji: '😕' },
  { type: ReactionType.Heart, emoji: '❤️' },
  { type: ReactionType.Rocket, emoji: '🚀' },
  { type: ReactionType.Eyes, emoji: '👀' },
];
