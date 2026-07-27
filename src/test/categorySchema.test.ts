import { describe, expect, it } from 'vitest'
import { categorySchema, UpdateCategorySchema } from '@/lib/schema'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** A valid UUID v4 string for use in parentId / id fields */
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_UUID_2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/** Returns a valid category payload with all required fields */
const validCategory = (overrides: Record<string, unknown> = {}) => ({
  name: 'Groceries',
  icon: '🛒',
  color: '137FEC',
  type: 'expense' as const,
  ...overrides,
})

// ── categorySchema ───────────────────────────────────────────────────────────

describe('categorySchema', () => {
  // ── Valid data ────────────────────────────────────────────────────────────

  describe('valid data', () => {
    it('accepts a valid expense category', () => {
      const result = categorySchema.safeParse(validCategory())
      expect(result.success).toBe(true)
    })

    it('accepts a valid income category', () => {
      const result = categorySchema.safeParse(validCategory({ type: 'income' }))
      expect(result.success).toBe(true)
    })

    it('accepts a valid category with a parentId', () => {
      const result = categorySchema.safeParse(
        validCategory({ parentId: VALID_UUID }),
      )
      expect(result.success).toBe(true)
    })

    it('accepts a valid category with parentId as null', () => {
      const result = categorySchema.safeParse(validCategory({ parentId: null }))
      expect(result.success).toBe(true)
    })

    it('accepts a valid category without parentId (optional)', () => {
      const result = categorySchema.safeParse(validCategory({ parentId: undefined }))
      expect(result.success).toBe(true)
    })
  })

  // ── name field ────────────────────────────────────────────────────────────

  describe('name', () => {
    it('fails with "Name is required" when name is empty', () => {
      const result = categorySchema.safeParse(validCategory({ name: '' }))
      expect(result.success).toBe(false)

      if (!result.success) {
        const nameError = result.error.issues.find(i => i.path.includes('name'))
        expect(nameError).toBeDefined()
        expect(nameError!.message).toBe('Name is required')
      }
    })

    it('fails when name exceeds 50 characters', () => {
      const longName = 'A'.repeat(51)
      const result = categorySchema.safeParse(validCategory({ name: longName }))
      expect(result.success).toBe(false)
    })

    it('trims whitespace from name', () => {
      const result = categorySchema.safeParse(validCategory({ name: '  Groceries  ' }))
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.name).toBe('Groceries')
      }
    })

    // NOTE: Zod's .trim() is a post-transform — it runs AFTER .min(1) validation.
    // A whitespace-only string like '   ' (length 3) passes min(1), then gets trimmed
    // to '' in the output. This means whitespace-only names are accepted by the schema.
    it('accepts whitespace-only name (trim is post-validation — known schema gap)', () => {
      const result = categorySchema.safeParse(validCategory({ name: '   ' }))
      expect(result.success).toBe(true)

      if (result.success) {
        // The value is trimmed AFTER validation, so the output is empty
        expect(result.data.name).toBe('')
      }
    })
  })

  // ── icon field ────────────────────────────────────────────────────────────

  describe('icon', () => {
    it('fails with "Please select an icon" when icon is empty', () => {
      const result = categorySchema.safeParse(validCategory({ icon: '' }))
      expect(result.success).toBe(false)

      if (!result.success) {
        const iconError = result.error.issues.find(i => i.path.includes('icon'))
        expect(iconError).toBeDefined()
        expect(iconError!.message).toBe('Please select an icon')
      }
    })
  })

  // ── color field ───────────────────────────────────────────────────────────

  describe('color', () => {
    it('fails when color is "xyz" (not hex, too short)', () => {
      const result = categorySchema.safeParse(validCategory({ color: 'xyz' }))
      expect(result.success).toBe(false)
    })

    it('fails when color is "12345" (5 characters, not 6)', () => {
      const result = categorySchema.safeParse(validCategory({ color: '12345' }))
      expect(result.success).toBe(false)
    })

    it('fails when color is "GGHHII" (non-hex characters)', () => {
      const result = categorySchema.safeParse(validCategory({ color: 'GGHHII' }))
      expect(result.success).toBe(false)
    })

    it('fails when color has a leading # (regex requires raw hex)', () => {
      const result = categorySchema.safeParse(validCategory({ color: '#137FEC' }))
      expect(result.success).toBe(false)
    })

    it('accepts a valid 6-char lowercase hex color', () => {
      const result = categorySchema.safeParse(validCategory({ color: '137fec' }))
      expect(result.success).toBe(true)
    })

    it('accepts a valid 6-char mixed-case hex color', () => {
      const result = categorySchema.safeParse(validCategory({ color: 'AbCdEf' }))
      expect(result.success).toBe(true)
    })
  })

  // ── type field ────────────────────────────────────────────────────────────

  describe('type', () => {
    it('fails when type is an invalid value', () => {
      // Pass a string that is NOT a valid enum member ('transfer' ∉ ['income','expense'])
      const result = categorySchema.safeParse(validCategory({ type: 'transfer' }))
      expect(result.success).toBe(false)
    })

    it('fails when type is missing (uses required_error)', () => {
      const { type: _, ...rest } = validCategory()
      const result = categorySchema.safeParse(rest)
      expect(result.success).toBe(false)

      if (!result.success) {
        const typeError = result.error.issues.find(i => i.path.includes('type'))
        expect(typeError).toBeDefined()
        expect(typeError!.message).toBe('Type is required')
      }
    })
  })

  // ── parentId field ────────────────────────────────────────────────────────

  describe('parentId', () => {
    it('accepts a valid UUID', () => {
      const result = categorySchema.safeParse(validCategory({ parentId: VALID_UUID }))
      expect(result.success).toBe(true)
    })

    it('accepts null', () => {
      const result = categorySchema.safeParse(validCategory({ parentId: null }))
      expect(result.success).toBe(true)
    })

    it('accepts undefined (optional field)', () => {
      const result = categorySchema.safeParse(validCategory({ parentId: undefined }))
      expect(result.success).toBe(true)
    })

    it('fails when parentId is an invalid UUID', () => {
      const result = categorySchema.safeParse(validCategory({ parentId: 'not-a-uuid' }))
      expect(result.success).toBe(false)
    })
  })
})

// ── UpdateCategorySchema ─────────────────────────────────────────────────────

describe('UpdateCategorySchema', () => {
  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Returns a valid update payload with all required fields */
  const validUpdate = (overrides: Record<string, unknown> = {}) => ({
    id: VALID_UUID,
    name: 'Groceries',
    icon: '🛒',
    color: '137FEC',
    type: 'expense' as const,
    ...overrides,
  })

  // ── id field ──────────────────────────────────────────────────────────────

  describe('id', () => {
    it('fails when id is missing', () => {
      const { id: _, ...rest } = validUpdate()
      const result = UpdateCategorySchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('fails when id is an invalid UUID', () => {
      const result = UpdateCategorySchema.safeParse(validUpdate({ id: 'not-a-uuid' }))
      expect(result.success).toBe(false)
    })

    it('accepts a valid UUID', () => {
      const result = UpdateCategorySchema.safeParse(validUpdate({ id: VALID_UUID_2 }))
      expect(result.success).toBe(true)
    })
  })

  // ── All categorySchema rules apply ────────────────────────────────────────

  describe('inherits categorySchema validation', () => {
    it('fails when name is empty', () => {
      const result = UpdateCategorySchema.safeParse(validUpdate({ name: '' }))
      expect(result.success).toBe(false)
    })

    it('fails when icon is empty', () => {
      const result = UpdateCategorySchema.safeParse(validUpdate({ icon: '' }))
      expect(result.success).toBe(false)
    })

    it('fails when color is invalid', () => {
      const result = UpdateCategorySchema.safeParse(validUpdate({ color: 'GGG' }))
      expect(result.success).toBe(false)
    })

    it('fails when type is invalid', () => {
      // Pass a string that is NOT a valid enum member ('savings' ∉ ['income','expense'])
      const result = UpdateCategorySchema.safeParse(validUpdate({ type: 'savings' }))
      expect(result.success).toBe(false)
    })

    it('fails when type is missing', () => {
      const { type: _, ...rest } = validUpdate()
      const result = UpdateCategorySchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('trims whitespace from name', () => {
      const result = UpdateCategorySchema.safeParse(validUpdate({ name: '  Housing  ' }))
      expect(result.success).toBe(true)

      if (result.success) {
        expect(result.data.name).toBe('Housing')
      }
    })

    it('accepts a valid parentId', () => {
      const result = UpdateCategorySchema.safeParse(
        validUpdate({ parentId: VALID_UUID }),
      )
      expect(result.success).toBe(true)
    })
  })
})
