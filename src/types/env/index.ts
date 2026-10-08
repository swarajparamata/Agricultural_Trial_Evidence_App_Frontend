import { z } from 'zod';

/** Blank values in `.env` count as "not set". */
const optionalVar = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

/** Contract for `import.meta.env`: the `VITE_*` variables from `.env` (see `.env.example`) plus Vite's `DEV` flag. */
export const EnvSchema = z
  .object({
    DEV: z.boolean(),
    VITE_API_BASE_URL: optionalVar.pipe(
      z.url({ error: 'must be a URL such as http://127.0.0.1:8000' }).optional(),
    ),
  })
  .superRefine((env, ctx) => {
    // Without a backend the app runs as an offline demo, which only the dev server allows.
    if (!env.DEV && !env.VITE_API_BASE_URL) {
      ctx.addIssue({
        code: 'custom',
        path: ['VITE_API_BASE_URL'],
        message: 'is required for production builds',
      });
    }
  });

export type Env = z.infer<typeof EnvSchema>;
