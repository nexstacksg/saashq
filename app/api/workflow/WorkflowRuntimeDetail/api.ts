import { httpClient } from '@/lib/http/httpClient';
import { z } from 'zod';

const ResponseSchema = z.object({
  _id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  workflowStatus: z.enum(['pending', 'completed', 'failed']),
  definition: z.object({
    _id: z.string(),
    name: z.string(),
    status: z.enum(['active', 'inactive']),
    description: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  logs: z.array(
    z.object({
      timestamp: z.string().datetime(),
      taskName: z.string(),
      log: z.string(),
      severity: z.enum(['log', 'info', 'warn', 'error']),
    })
  ),
  tasks: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      next: z.array(z.string()),
      previous: z.array(z.string()),
      params: z.record(z.string(), z.any()).optional(),
      exec: z.string().optional(),
      type: z.enum(['FUNCTION', 'WAIT', 'START', 'END', 'LISTEN', 'GUARD']),
      status: z.enum(['pending', 'completed', 'started', 'failed']),
    })
  ),
  workflowResults: z.record(z.string(), z.any()).optional(),
});

export type ResponseSchemaType = z.infer<typeof ResponseSchema>;

export const API_NAME = 'workflow-runtime-detail';

export const API = async (id: string) => {
  const response = await httpClient
    .get(`/runtime/${id}/detail`, {
      headers: {
        //Authorization: ['Bearer', token].join(' '),
      },
    })
    .then((res) => res.data);

  return ResponseSchema.parse(response.data);
};
