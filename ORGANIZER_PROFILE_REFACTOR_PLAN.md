# Organizer Profile Address Refactor Plan

## Current State (Overcomplicated)
- ❌ 8 individual database columns for address fields
- ❌ Complex type definitions across multiple files
- ❌ Heavy API modifications
- ❌ Redundant validation schemas

## Goal: Simplified, Efficient Implementation

### Approach: JSON Field + Component Reuse

#### 1. Database Schema Simplification
```sql
-- Replace 8 individual columns with single JSON field
ALTER TABLE OrganizerProfile 
DROP COLUMN defaultLocationType, defaultStreetAddress, defaultCity, 
           defaultState, defaultZipCode, defaultCountry, 
           defaultVirtualLink, defaultVirtualPlatform;

ADD COLUMN defaultLocationData JSON;
```

#### 2. Reuse Event Form Components
- Extract `EventBasicInfoFields` location section into `<LocationInput>` component
- Use same component in both `/create-event` and `/organizer-profile/edit`
- Single source of truth for address logic

#### 3. Type Simplification
```typescript
interface DefaultLocationData {
  type: 'address' | 'virtual';
  address?: AddressData;
  virtual?: VirtualData;
  summary: string;
}

// Reuse existing EventFormData types where possible
```

#### 4. API Streamlining
- Single `defaultLocationData` JSON field in API
- No individual field handling
- Simpler validation

## Benefits of Refactor
- 🎯 **Consistency**: Same components used everywhere
- 🚀 **Performance**: Fewer database columns, simpler queries
- 🧹 **Maintainability**: Single location component to maintain
- 📦 **Smaller Bundle**: Less duplicate code
- 🔧 **Easier Testing**: One component to test thoroughly

## Implementation Steps
1. Create `<LocationInput>` component from `/create-event` logic
2. Update schema to use JSON field
3. Update types to reuse existing structures
4. Simplify API to handle JSON
5. Replace complex form with simple component usage
6. Clean up old code and types

## Files to Modify
- `src/components/ui/location-input.tsx` (new)
- `prisma/schema.prisma` (simplify)
- `src/types/forms.ts` (reduce complexity)
- `src/app/organizer-profile/edit/page.tsx` (simplify)
- `src/app/api/organizer-profile/route.ts` (simplify)

## Estimated Time: 2-3 hours vs. 6+ hours current approach

---
*Note: Current implementation works but is overengineered. This refactor prioritizes simplicity and reusability.* 