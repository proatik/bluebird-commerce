import { z } from 'zod';
import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';
import { Injectable, HttpException } from '@nestjs/common';

import { htmlToText } from '@/common/html-to-text';
import { createProductSchema } from '@/validation';
import { EnvService } from '@/modules/config/env.service';
import { fetchUrl, assertFetchable } from '@/common/fetch-url';
import { ProductsService } from '@/modules/products/products.service';

import type { ImportProductsResponse } from '@/validation';

const candidateProductSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string().nullable(),
  sku: z.string().nullable(),
  stock: z.number().nullable(),
  imageUrl: z.string().nullable()
});

const extractionResultSchema = z.object({
  products: z.array(candidateProductSchema)
});

const EXTRACTION_PROMPT = [
  'Extract every distinct real product visible in the given page text.',
  'Each product needs at least a name and a price to be worth including.',
  'Only set imageUrl when it is a full absolute URL; otherwise leave it null.',
  'currency must be a 3-letter ISO 4217 code (e.g. USD, GBP, EUR, BDT) — never a symbol like $ or £;',
  'if you cannot tell the currency code, leave it null.',
  'If the page is not a product listing or product page — an article, a homepage,',
  'an "about us" page, empty or login-walled content — return an empty products array.',
  'Never invent a product to have something to return.'
].join(' ');

type CandidateProduct = z.infer<typeof candidateProductSchema>;

@Injectable()
export class ProductsImportService {
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(
    env: EnvService,
    private readonly products: ProductsService
  ) {
    this.openai = new OpenAI({ apiKey: env.openaiApiKey });
    this.model = env.openaiModel;
  }

  async importFromUrl(url: string): Promise<ImportProductsResponse> {
    assertFetchable(url);

    const html = await fetchUrl(url);
    const text = htmlToText(html);

    const candidates = await this.extractCandidates(text);

    const products: ImportProductsResponse['products'] = [];
    const errors: ImportProductsResponse['errors'] = [];

    for (const candidate of candidates) {
      const input = this.normalizeCandidate(candidate);
      const parsed = createProductSchema.safeParse(input);

      if (!parsed.success) {
        errors.push({
          reason: parsed.error.issues.map((issue) => issue.message).join('; '),
          product: candidate
        });
        continue;
      }

      try {
        const created = await this.products.create(parsed.data);

        products.push(created);
      } catch (error) {
        if (error instanceof HttpException) {
          errors.push({ reason: error.message, product: candidate });
          continue;
        }

        throw error;
      }
    }

    return { imported: products.length, skipped: errors.length, products, errors };
  }

  private async extractCandidates(text: string): Promise<CandidateProduct[]> {
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: text }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extraction_result',
          strict: true,
          schema: z.toJSONSchema(extractionResultSchema)
        }
      }
    });

    const content = response.choices[0].message.content ?? '{"products":[]}';
    const parsed = extractionResultSchema.safeParse(JSON.parse(content));

    return parsed.success ? parsed.data.products : [];
  }

  private normalizeCandidate(candidate: CandidateProduct): unknown {
    const sku = candidate.sku ?? `${this.slugify(candidate.name ?? 'product')}-${randomUUID().slice(0, 8)}`;

    return {
      name: candidate.name ?? undefined,
      description: candidate.description ?? undefined,
      category: candidate.category ?? undefined,
      price: candidate.price ?? undefined,
      currency: candidate.currency ?? undefined,
      sku,
      stock: candidate.stock ?? undefined,
      imageUrl: candidate.imageUrl ?? undefined
    };
  }

  private slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);

    return slug || 'product';
  }
}
