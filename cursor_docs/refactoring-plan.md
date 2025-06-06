# Event Management Enhancements - Refactoring Plan

## 🔍 Current State Evaluation

### ✅ Successfully Implemented Features

#### Database & API Layer
- ✅ **Event Status System**: Database schema updated with `status` field (draft/published/cancelled)
- ✅ **CRUD API Endpoints**: Complete `/api/events/[id]` implementation (GET, PUT, POST for clone, DELETE)
- ✅ **Bulk Email API**: `/api/events/[id]/bulk-email` endpoint with Resend integration
- ✅ **Data Validation**: Proper user authorization and input validation

#### User Interface
- ✅ **Dashboard Enhancements**: Status filtering, action dropdowns, enhanced event cards
- ✅ **Edit Event Page**: Complete `/edit-event/[id]/page.tsx` with navigation
- ✅ **Attendee Management**: Comprehensive `/event/[id]/attendees/page.tsx` with bulk operations
- ✅ **Visual Design**: Status badges, improved UI components, responsive design

#### Business Logic
- ✅ **Event Workflow**: Draft → Published workflow logic
- ✅ **Clone Functionality**: Smart event duplication with date/title adjustments
- ✅ **Filtering System**: Multi-criteria event filtering in dashboard
- ✅ **Bulk Operations**: Mass email and CSV export capabilities

### ❌ Critical Issues Requiring Refactoring

#### TypeScript Type Issues
- **Form Type Conflicts**: `event-form.tsx` has complex type mismatches with react-hook-form
- **Prisma Type Misalignment**: `attendees/page.tsx` missing `referral` property in Registration type
- **Schema Evolution**: Form schema changes breaking existing type contracts

#### Architectural Concerns
- **Form Component Complexity**: EventForm component trying to handle too many responsibilities
- **Type Safety Gaps**: Missing proper typing for API responses and form submissions
- **Component Dependencies**: Tight coupling between form logic and UI presentation

## 🎯 Refactoring Strategy

### Phase 1: Type System Stabilization (Priority: HIGH)

#### 1.1 Fix Prisma Type Definitions
**Files**: `src/types/event.ts`, `src/app/api/events/[id]/route.ts`
- **Issue**: Registration type missing `referral` relationship
- **Solution**: Update API endpoint to properly include referral data
- **Action**: Modify Prisma query to include referral relation

#### 1.2 Redesign Form Type Architecture  
**Files**: `src/components/event-form.tsx`
- **Issue**: Complex union types causing react-hook-form conflicts
- **Solution**: Separate form types from database types
- **Action**: Create dedicated `FormData` interfaces

#### 1.3 Create Type-Safe API Contracts
**Files**: `src/types/api.ts` (new), all API routes
- **Issue**: Inconsistent API response types
- **Solution**: Shared type definitions for API contracts
- **Action**: Define request/response interfaces

### Phase 2: Component Architecture Improvement (Priority: MEDIUM)

#### 2.1 Decompose EventForm Component
**Current**: Single large component handling create/edit modes
**Target**: Specialized components with clear responsibilities
```
EventForm (base logic)
├── EventFormFields (field definitions)
├── EventFormStatus (status-specific logic)
└── EventFormActions (submit/cancel logic)
```

#### 2.2 Extract Business Logic from UI
**Files**: `src/lib/event-operations.ts` (new), UI components
- **Issue**: Business logic mixed with presentation
- **Solution**: Pure functions for event operations
- **Action**: Extract CRUD operations, validation logic

#### 2.3 Improve State Management
**Files**: Dashboard, attendee management pages
- **Issue**: Local state handling complex operations
- **Solution**: Custom hooks for data fetching/mutations
- **Action**: Create `useEventOperations`, `useAttendeeManagement` hooks

### Phase 3: Development Experience Enhancement (Priority: LOW)

#### 3.1 Enhanced Error Handling
**Files**: All API routes, error boundary components
- **Issue**: Inconsistent error response formats
- **Solution**: Standardized error handling pattern
- **Action**: Create error handling utilities

#### 3.2 Performance Optimizations
**Files**: Dashboard, large data lists
- **Issue**: Potential performance issues with large datasets
- **Solution**: Pagination, memoization, lazy loading
- **Action**: Implement virtual scrolling for attendee lists

## 📋 Detailed Refactoring Steps

### Step 1: Fix Registration Type Issue
**Estimated Time**: 30 minutes
**Risk Level**: Low

```typescript
// In src/app/api/events/[id]/route.ts
registrations: {
  select: {
    id: true,
    name: true,
    email: true,
    status: true,
    createdAt: true,
    customQuestions: true,
    referralId: true,
    referral: {
      select: {
        id: true,
        name: true,
      },
    },
  },
},
```

### Step 2: Create Form Type Definitions
**Estimated Time**: 1 hour
**Risk Level**: Medium

```typescript
// In src/types/forms.ts (new file)
export interface EventFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  bio: string;
  agenda: string;
  qa?: string;
  status: 'draft' | 'published';
  image?: any;
}

export interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  mode: 'create' | 'edit';
}
```

### Step 3: Refactor EventForm Component
**Estimated Time**: 2 hours
**Risk Level**: High

- Extract form schema to separate file
- Use proper generic typing for react-hook-form
- Separate status logic into dedicated component
- Create reusable field components

### Step 4: Add Comprehensive Testing
**Estimated Time**: 1.5 hours
**Risk Level**: Low

- Unit tests for form validation
- Integration tests for API endpoints
- E2E tests for critical user workflows

## 🚦 Implementation Priority

### Immediate (This Session)
1. **Fix Registration Type Issue** - Blocks attendee management
2. **Create Basic Form Types** - Enables form functionality

### Next Session
3. **Refactor EventForm Component** - Major architectural improvement
4. **Extract Business Logic** - Better separation of concerns

### Future Sessions
5. **Add Performance Optimizations** - Scalability improvements
6. **Enhance Error Handling** - Better user experience

## 🎯 Success Criteria

### Technical
- [ ] Zero TypeScript compilation errors
- [ ] All tests passing
- [ ] Clean component architecture
- [ ] Type-safe API contracts

### Functional
- [ ] Event creation/editing works flawlessly
- [ ] Status management fully functional
- [ ] Bulk operations working correctly
- [ ] Dashboard filtering and actions operational

### User Experience
- [ ] Smooth workflows for all event management tasks
- [ ] Clear feedback for all operations
- [ ] Responsive design maintained
- [ ] Performance remains excellent

## 📈 Post-Refactoring Benefits

1. **Developer Experience**: Cleaner code, better IntelliSense, easier debugging
2. **Maintainability**: Clear separation of concerns, reusable components
3. **Scalability**: Proper architecture for future feature additions
4. **Reliability**: Type safety prevents runtime errors
5. **Performance**: Optimized rendering and data fetching

## 🔄 Risk Mitigation

- **Incremental Changes**: Make small, testable changes
- **Backup Strategy**: Commit working state before major refactors
- **Validation**: Test each change thoroughly before proceeding
- **Rollback Plan**: Keep previous working versions accessible

---

**Note**: This refactoring plan maintains all existing functionality while improving code quality, type safety, and architectural clarity. The goal is to transform our working implementation into production-ready, maintainable code. 