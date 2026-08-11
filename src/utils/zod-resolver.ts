import type { z } from 'zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import { zodResolver as createZodResolver } from '@hookform/resolvers/zod';

/**
 * Keeps the project's existing form value types while using the Zod 4-compatible resolver.
 * Zod schemas with defaults may accept a wider input shape than the normalized form values.
 */
export function zodResolver<
  TOutput extends FieldValues,
  TInput extends FieldValues = TOutput,
>(schema: z.ZodType<TOutput, TInput>): Resolver<TOutput> {
  return createZodResolver(schema) as unknown as Resolver<TOutput>;
}
