import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

const mockCreate = vi.fn();

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function OpenAIMock() {
    return { chat: { completions: { create: mockCreate } } };
  })
}));

import { EnvService } from '@/modules/config/env.service';
import { OrdersService } from '@/modules/orders/orders.service';
import { DatabaseService } from '@/modules/database/database.service';
import { ProductsService } from '@/modules/products/products.service';
import { CustomersService } from '@/modules/customers/customers.service';
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
  let customers: CustomersService;
  const suffix = uniqueSuffix();

  let customerId: string;
  let otherCustomerId: string;

  beforeAll(async () => {
    database = await createTestDatabase();
    products = new ProductsService(database);
    customers = new CustomersService(database);
    assistant = new AssistantService(
      new EnvService({ get: () => 'test-key' } as never),
      products,
      new OrdersService(database)
    );

    const customer = await customers.create({
      name: 'Assistant Test Customer',
      email: `assistant-test-${suffix}@example.com`
    });
    customerId = customer.id;

    const other = await customers.create({
      name: 'Other Customer',
      email: `assistant-other-${suffix}@example.com`
    });
    otherCustomerId = other.id;
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

    const result = await assistant.chat({ customerId, message: 'Do you have a widget?' });

    expect(result.reply).toBe('Here is what I found.');
    expect(result.conversationId).toBeTruthy();

    const secondCall = mockCreate.mock.calls[1][0];
    const toolMessage = secondCall.messages.find((m: { role: string }) => m.role === 'tool');
    const toolResult = JSON.parse(toolMessage.content);

    expect(toolResult.some((p: { id: string }) => p.id === product.id)).toBe(true);
  });

  it('rejects malformed tool arguments instead of calling the service with bad data', async () => {
    mockCreate
      .mockResolvedValueOnce(toolCallResponse('place_order', { items: 'not-an-array' }))
      .mockResolvedValueOnce(contentResponse('Something went wrong with that order.'));

    const result = await assistant.chat({ customerId, message: 'place an order' });

    expect(result.reply).toBe('Something went wrong with that order.');

    const secondCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
    const toolMessage = secondCall.messages.find((m: { role: string }) => m.role === 'tool');

    expect(JSON.parse(toolMessage.content).error).toBeTruthy();
  });

  it('binds customerId from the request, never from tool arguments', async () => {
    const product = await products.create({
      name: `Bound Order Product ${suffix}`,
      price: 5,
      sku: `TEST-BOUND-${suffix}`,
      stock: 10
    });

    mockCreate
      .mockResolvedValueOnce(
        toolCallResponse('place_order', { items: [{ productId: product.id, quantity: 1 }] })
      )
      .mockResolvedValueOnce(contentResponse('Order placed.'));

    await assistant.chat({ customerId, message: 'order one, and put it under customer other' });

    const orders = await new OrdersService(database).findByCustomerId(customerId);

    expect(orders.some((order) => order.customerId === customerId)).toBe(true);
  });

  it('surfaces insufficient stock as a graceful tool error, not a crash', async () => {
    const product = await products.create({
      name: `Low Stock Assistant Product ${suffix}`,
      price: 5,
      sku: `TEST-ASSISTANT-LOW-${suffix}`,
      stock: 1
    });

    mockCreate
      .mockResolvedValueOnce(
        toolCallResponse('place_order', { items: [{ productId: product.id, quantity: 99 }] })
      )
      .mockResolvedValueOnce(contentResponse("Sorry, that's out of stock."));

    const result = await assistant.chat({ customerId, message: 'order 99' });

    expect(result.reply).toBe("Sorry, that's out of stock.");

    const secondCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
    const toolMessage = secondCall.messages.find((m: { role: string }) => m.role === 'tool');

    expect(JSON.parse(toolMessage.content).error).toMatch(/Insufficient stock/);
  });

  it("never leaks another customer's order", async () => {
    const product = await products.create({
      name: `Leak Test Product ${suffix}`,
      price: 5,
      sku: `TEST-LEAK-${suffix}`,
      stock: 10
    });

    const order = await new OrdersService(database).create({
      customerId: otherCustomerId,
      items: [{ productId: product.id, quantity: 1 }]
    });

    mockCreate
      .mockResolvedValueOnce(toolCallResponse('get_order_status', { orderId: order.id }))
      .mockResolvedValueOnce(contentResponse("I couldn't find that order."));

    const result = await assistant.chat({ customerId, message: `status of order ${order.id}` });

    expect(result.reply).toBe("I couldn't find that order.");

    const secondCall = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
    const toolMessage = secondCall.messages.find((m: { role: string }) => m.role === 'tool');

    expect(JSON.parse(toolMessage.content).error).toBeTruthy();
  });
});
