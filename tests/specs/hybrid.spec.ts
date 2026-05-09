import { test, expect } from '../fixtures';

/**
 * Hybrid test — set up state via API, then verify in UI.
 *
 * This is the cleanest pattern in real-world automation:
 *  - Don't burn 10 seconds clicking through forms to set up data
 *  - Use the API (1-2 seconds), then verify the UI reflects it
 *  - Cuts test time, reduces flakiness from intermediate steps
 */
test.describe('Hybrid: API setup → UI verify @regression', () => {
  test('note created via API appears in UI list', async ({ page, apiClient }) => {
    // 1. Setup via API (fast)
    await apiClient.login(
      process.env.USERNAME ?? 'practice',
      process.env.PASSWORD ?? 'SuperSecretPassword!',
    );
    const note = await apiClient.post('/notes', {
      title: 'Hybrid test note',
      description: 'created by API',
      category: 'Work',
    });
    const noteId = note.data.id;

    // 2. Verify via UI
    await page.goto('/notes');
    const card = page.getByText('Hybrid test note');
    await expect(card).toBeVisible();

    // 3. Cleanup via API
    await apiClient.delete(`/notes/${noteId}`);
  });
});
