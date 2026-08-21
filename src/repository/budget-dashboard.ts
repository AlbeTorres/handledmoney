import { db } from '@/db'
import { currentBudgetsTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * One owner-scoped query for the authenticated user's current budget:
 * current selection → budget → groups (ordered by `sortOrder`) → items with
 * their category display context. Archived categories are retained because
 * the category relation applies no archived_at filter, keeping historical
 * display context available. Returns `null` as the explicit empty state when
 * the owner has no current selection or the selected budget is not owned.
 *
 * Planned amounts are raw monthly-scale finite numbers; the period multiplier
 * (×12 in annual mode) is applied later by the shared plan projection, never
 * here.
 */
export async function getDashboardBudget(userId: string) {
  const selection = await db.query.currentBudgetsTable.findFirst({
    where: eq(currentBudgetsTable.userId, userId),
    with: {
      budget: {
        with: {
          groups: {
            orderBy: (groups, { asc }) => [asc(groups.sortOrder)],
            with: {
              items: { with: { category: true } },
            },
          },
        },
      },
    },
  })

  return selection?.budget
}
