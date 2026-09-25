import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function OpenAIMock() {
    return { chat: { completions: { create: mockCreate } } };
  })
}));

import { EnvService } from '@/modules/config/env.service';
import { DatabaseService } from '@/modules/database/database.service';
import { ProductsService } from '@/modules/products/products.service';
import { AssistantService } from '@/modules/assistant/assistant.service';

import { uniqueSuffix, createTestDatabase } from '../helpers/test-database';

function toolCallResponse(name: string, args: unknown) {
  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: { name, arguments: JSON.stringify(args) }
            }
          ]
        }
      }
    ]
  };
}

function contentResponse(content: string) {
  return { choices: [{ message: { role: 'assistant', content, tool_calls: undefined } }] };
}

describe('AssistantService', () => {
  let database: DatabaseService;
  let assistant: AssistantService;
  let products: ProductsService;
  const suffix = uniqueSuffix();

  beforeAll(async () => {
    database = await createTestDatabase();
    products = new ProductsService(database);
    assistant = new AssistantService(new EnvService({ get: () => 'test-key' } as never), products);
  });

  afterAll(async () => {
    await database.onModuleDestroy();
  });

  it('answers a product question using search_products against real data', async () => {
    const product = await products.create({
      name: `Assistant Widget ${suffix}`,
      price: 12,
      sku: `TEST-ASSISTANT-${suffix}`,
      stock: 5
    });

    mockCreate
      .mockResolvedValueOnce(toolCallResponse('search_products', { q: `Assistant Widget ${suffix}` }))
      .mockResolvedValueOnce(contentResponse('Here is what I found.'));

    const result = await assistant.chat({ message: 'Do you have a widget?' });

    expect(result.reply).toBe('Here is what I found.');
    expect(result.conversationId).toBeTruthy();

    const secondCall = mockCreate.mock.calls[1][0];
    const toolMessage = secondCall.messages.find((m: { role: string }) => m.role === 'tool');
    const toolResult = JSON.parse(toolMessage.content);

    expect(toolResult.some((p: { id: string }) => p.id === product.id)).toBe(true);
  });

  it('rejects malformed tool arguments instead of calling the service with bad data', async () => {
    mockCreate
      .mockResolvedValueOnce(toolCallResponse('search_products', { maxPrice: 'not-a-number' }))
      .mockResolvedValueOnce(contentResponse("Sorry, I couldn't search with that."));

    const result = await assistant.chat({ message: 'find something under a squillion dollars' });

    expect(result.reply).toBe("Sorry, I couldn't search with that.");

    const secondCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
    const toolMessage = secondCall.messages.find((m: { role: string }) => m.role === 'tool');

    expect(JSON.parse(toolMessage.content).error).toBeTruthy();
  });
});
