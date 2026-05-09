import { test, expect } from '../fixtures';
import { NoteSchema } from '../api/ApiClient';

/**
 * Pure API test — no browser involved.
 * Uses the apiClient fixture which wraps Playwright's request context.
 *
 * Demonstrates: full CRUD + schema validation.
 */
test.describe('Notes API @api', () => {
  let createdId: string;

  test.beforeAll(async ({ apiClient }) => {
    await apiClient.login(
      process.env.USERNAME ?? 'practice',
      process.env.PASSWORD ?? 'SuperSecretPassword!',
    );
  });

  test('POST /notes creates a note', async ({ apiClient }) => {
    const note = await apiClient.post(
      '/notes',
      { title: 'Interview prep', description: 'Playwright + API', category: 'Work' },
      NoteSchema,
    );
    expect(note.success).toBeTruthy();
    expect(note.data.title).toBe('Interview prep');
    createdId = note.data.id;
  });

  test('GET /notes/:id returns the created note', async ({ apiClient }) => {
    const note = await apiClient.get(`/notes/${createdId}`, NoteSchema);
    expect(note.data.id).toBe(createdId);
  });

  test('PUT /notes/:id updates the note', async ({ apiClient }) => {
    const updated = await apiClient.put(`/notes/${createdId}`, {
      title: 'Updated', description: 'd', category: 'Work', completed: true,
    });
    expect(updated.data.title).toBe('Updated');
  });

  test('DELETE /notes/:id removes the note', async ({ apiClient }) => {
    await apiClient.delete(`/notes/${createdId}`);
  });
});
