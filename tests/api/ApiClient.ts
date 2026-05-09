import { APIRequestContext, expect } from '@playwright/test';
import { z } from 'zod';

/**
 * ApiClient — wrapper around Playwright's APIRequestContext.
 * Centralizes auth headers, base URL, error handling, and schema validation.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private token?: string,
  ) {}

  // Auth — captures token, used by subsequent calls
  async login(username: string, password: string): Promise<string> {
    const res = await this.request.post('/users/login', {
      form: { email: username, password },
    });
    expect(res.ok(), `Login failed: ${res.status()}`).toBeTruthy();
    const body = await res.json();
    this.token = body.data.token;
    return this.token!;
  }

  // GET — generic with schema validation
  async get<T>(path: string, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.request.get(path, { headers: this.authHeaders() });
    expect(res.ok(), `GET ${path} → ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return schema ? schema.parse(body) : (body as T);
  }

  // POST
  async post<T>(path: string, payload: unknown, schema?: z.ZodSchema<T>): Promise<T> {
    const res = await this.request.post(path, {
      headers: this.authHeaders(),
      data: payload,
    });
    expect(res.ok(), `POST ${path} → ${res.status()}`).toBeTruthy();
    const body = await res.json();
    return schema ? schema.parse(body) : (body as T);
  }

  // PUT
  async put<T>(path: string, payload: unknown): Promise<T> {
    const res = await this.request.put(path, {
      headers: this.authHeaders(),
      data: payload,
    });
    expect(res.ok()).toBeTruthy();
    return res.json();
  }

  // DELETE
  async delete(path: string): Promise<void> {
    const res = await this.request.delete(path, { headers: this.authHeaders() });
    expect([200, 204]).toContain(res.status());
  }

  // Build auth headers — null token = unauthenticated request
  private authHeaders(): Record<string, string> {
    return this.token ? { 'X-Auth-Token': this.token } : {};
  }
}

/**
 * Example Zod schema — validates response shape AT RUNTIME.
 * If the API contract changes, the test fails fast with a clear error.
 */
export const NoteSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    completed: z.boolean(),
    user_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type Note = z.infer<typeof NoteSchema>;
