import { registry, errorResponseSchema } from '@/openapi/registry';
import { chatRequestSchema, chatResponseSchema } from '@/validation';

const tags = ['assistant'];
const chatSchema = registry.register('ChatResponse', chatResponseSchema);

registry.registerPath({
  method: 'post',
  path: '/api/assistant/chat',
  tags,
  summary: 'Chat with the shopping assistant.',
  request: {
    body: { content: { 'application/json': { schema: chatRequestSchema } } }
  },
  responses: {
    200: {
      description: 'The reply.',
      content: { 'application/json': { schema: chatSchema } }
    },
    400: {
      description: 'Invalid request body.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});
