import { z } from 'zod';

export const TOPIC_SLUGS = ['workplace', 'school', 'healthcare', 'justice', 'military', 'other'] as const;

export const submitStorySchema = z.object({
  title: z.string().max(140).optional(),
  body: z.string().min(10, 'Please write a little more.').max(8000),
  topics: z.array(z.enum(TOPIC_SLUGS)).max(6).default([]),
  anonymous: z.boolean().default(true),
  hideLocation: z.boolean().default(true),
});
export type SubmitStoryInput = z.infer<typeof submitStorySchema>;

export const commentSchema = z.object({
  body: z.string().min(2).max(2000),
  anonymous: z.boolean().default(true),
});
