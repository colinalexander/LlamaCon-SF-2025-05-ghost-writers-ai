import { z } from 'zod';
import { ErrorGuard } from './error-guard';

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  genre: z.string().min(1, 'Genre is required'),
  audience: z.string().min(1, 'Target audience is required'),
  style: z.string().min(1, 'Writing style is required'),
  storyLength: z.string().min(1, 'Story length is required'),
});

export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  background: z.string().min(1, 'Background is required'),
  personalityTraits: z.string().min(1, 'Personality traits are required'),
  skills: z.string().min(1, 'Skills are required'),
  wants: z.string().min(1, 'Character wants are required'),
  fears: z.string().min(1, 'Character fears are required'),
  appearance: z.string().min(1, 'Appearance is required'),
  status: z.string().min(1, 'Status is required'),
  notes: z.string().optional(),
  codename: z.string().optional(),
});

export const sceneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  time: z.string().min(1, 'Time is required'),
  conflict: z.string().min(1, 'Conflict is required'),
  charactersPresent: z.string().min(1, 'Characters present are required'),
  characterChanges: z.string().optional(),
  importantActions: z.string().min(1, 'Important actions are required'),
  mood: z.string().min(1, 'Mood is required'),
  summary: z.string().min(1, 'Summary is required'),
});

export class FormValidator {
  static validateProject(data: unknown) {
    try {
      return projectSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        ErrorGuard.handleError(error.errors[0].message);
      }
      return null;
    }
  }

  static validateCharacter(data: unknown) {
    try {
      return characterSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        ErrorGuard.handleError(error.errors[0].message);
      }
      return null;
    }
  }

  static validateScene(data: unknown) {
    try {
      return sceneSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        ErrorGuard.handleError(error.errors[0].message);
      }
      return null;
    }
  }
}