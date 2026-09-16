# Permission System Implementation Guide

## Overview

This guide explains how to implement a comprehensive permission-based access control system for your multi-tenant SaaS application.

## Architecture Decisions

### 1. Should permissions be included in user responses?

**Yes, but strategically:**

- **✅ Include in `GET /auth/me`** - Called once on app load, perfect for client-side permission checks
- **❌ Don't include in `GET /users`** - Keep list responses lean
- **❌ Don't include in `GET /users/:id`** - Basic user info only
- **✅ Create `GET /users/:id/permissions`** - Separate endpoint for viewing a user's permissions (requires `permissions:list`)

### 2. How to handle frontend permission checks?

**Three-layer approach:**

1. **Route-level guards** - Block access to entire pages (`PermissionRoute`)
2. **Component-level guards** - Show/hide UI elements (`PermissionGuard`)
3. **Programmatic checks** - Use `usePermissions()` hook for conditional logic

## Permission Model

### Permission Format

```
resource:action
```

Examples:

- `users:read` - View users
- `users:create` - Create users
- `users:*` - All actions on users
- `*` - Superuser (all access)

### Wildcard Support

The system supports wildcards for flexibility:

- `*` - Grants access to everything (superuser)
- `users:*` - Grants all actions on users resource
- `products:*` - Grants all actions on products resource

### Permission Hierarchy

Permissions are aggregated from two sources:

1. **Direct user permissions** (`user_permissions` table)
2. **Group permissions** (`group_permissions` via `user_groups`)

The system automatically combines both and deduplicates them.

## Frontend Implementation

### Step 1: Update User Type

```typescript
// types/user.ts
export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_root: boolean;
  tenant_id: string;
  permissions: Permission[]; // Add this!
  created_at: string;
  updated_at: string;
};
```

### Step 2: Wrap App with PermissionProvider

```typescript
// App.tsx
import { PermissionProvider } from '@/contexts/PermissionContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider>  {/* Add this wrapper */}
        <BrowserRouter>
          {/* Your routes */}
        </BrowserRouter>
      </PermissionProvider>
    </QueryClientProvider>
  );
}
```

### Step 3: Protect Routes

```typescript
// In your route configuration
<Route
  path="/users"
  element={
    <PermissionRoute permission="users:read">
      <UserList />
    </PermissionRoute>
  }
/>
```

### Step 4: Conditionally Render UI

```typescript
// In any component
import { PermissionGuard } from '@/components/guards/PermissionGuard';

function MyComponent() {
  return (
    <div>
      {/* Only users with "users:create" can see this button */}
      <PermissionGuard permission="users:create">
        <Button>Create User</Button>
      </PermissionGuard>

      {/* Require multiple permissions (OR logic) */}
      <PermissionGuard permissions={["users:update", "users:delete"]}>
        <Button>Edit User</Button>
      </PermissionGuard>

      {/* Require ALL permissions (AND logic) */}
      <PermissionGuard
        permissions={["users:read", "groups:read"]}
        requireAll
      >
        <UserGroupManager />
      </PermissionGuard>
    </div>
  );
}
```

### Step 5: Programmatic Permission Checks

```typescript
// For complex conditional logic
import { usePermissions } from '@/contexts/PermissionContext';

function UserActions({ user }) {
  const { can, canAny, canAll } = usePermissions();

  const handleAction = () => {
    if (can('users:update')) {
      // User can update, proceed
    } else {
      // Show error or hide option
    }
  };

  // Check multiple permissions
  const canManageUser = canAll(['users:update', 'users:delete']);

  return (
    <div>
      {canManageUser && <Button onClick={handleAction}>Manage</Button>}
    </div>
  );
}
```

## Backend Implementation

### Step 1: Update /auth/me Endpoint

```python
@router.get("/me", response_model=UserWithPermissions)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get all permissions (direct + group-inherited)
    permissions = await get_user_permissions(db, current_user.id)

    # Return user with permissions
    return UserWithPermissions(
        **current_user.__dict__,
        permissions=permissions,  # Include permissions!
    )
```

### Step 2: Implement Permission Service

See `backend_examples.py` artifact for full implementation of:

- `get_user_permissions()` - Aggregates all user permissions
- `has_permission()` - Checks if user has specific permission
- `require_permission()` - FastAPI dependency for route protection

### Step 3: Protect API Endpoints

```python
from api.deps import require_permission

@router.get("/users", response_model=List[UserList])
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_permission("users:read")),  # Protect endpoint
):
    users = await list_users(db, current_user.tenant_id)
    return users
```

## Permission Flow

### On App Load

1. User logs in → Session created
2. Frontend calls `GET /auth/me`
3. Backend returns user with all permissions
4. PermissionProvider stores permissions in React context
5. All `PermissionGuard` and route guards now work

### On Protected Action

1. User clicks "Create User" button
2. PermissionGuard checks if user has `users:create`
3. If yes → button is visible and clickable
4. If no → button is hidden
5. When API is called, backend double-checks permission
6. If user somehow bypassed frontend → backend returns 403

## Security Best Practices

### Defense in Depth

**Always enforce permissions on both frontend AND backend:**

- **Frontend checks** - Better UX, don't show actions user can't perform
- **Backend checks** - Security boundary, prevent malicious requests

### Never Trust the Client

Even if frontend hides a button, always check permissions on the backend. Users can:

- Modify frontend code
- Craft API requests manually
- Bypass frontend guards

### Principle of Least Privilege

- Grant minimum permissions needed
- Use specific permissions (`users:read`) over wildcards (`users:*`)
- Only use `*` for platform administrators

## Common Patterns

### Hide entire sections

```typescript
// Sidebar navigation
<PermissionGuard permission="users:read">
  <NavLink to="/users">Users</NavLink>
</PermissionGuard>
```

### Conditional rendering based on multiple permissions

```typescript
// Show delete button only if user can both update AND delete
<PermissionGuard permissions={["users:update", "users:delete"]} requireAll>
  <Button variant="destructive">Delete User</Button>
</PermissionGuard>
```

### Disable instead of hide

```typescript
const { can } = usePermissions();

<Button disabled={!can('users:create')}>
  Create User
</Button>
```

### Show different UI based on permissions

```typescript
const { can } = usePermissions();

if (can('users:update')) {
  return <FullUserEditor />;
} else if (can('users:read')) {
  return <ReadOnlyUserView />;
} else {
  return <AccessDenied />;
}
```

## Testing Permissions

### Test different permission sets

```typescript
// Mock user with specific permissions for testing
const mockUserWithReadOnly = {
  ...baseUser,
  permissions: [{ code: "users:read", resource: "users", action: "read" }],
};

const mockUserWithFullAccess = {
  ...baseUser,
  permissions: [{ code: "*", resource: "*", action: "*" }],
};
```

### Test permission guards

```typescript
// Verify UI elements are hidden/shown correctly
render(
  <PermissionProvider>
    <PermissionGuard permission="users:create">
      <button>Create</button>
    </PermissionGuard>
  </PermissionProvider>
);

// Button should not be visible if user lacks permission
expect(screen.queryByText('Create')).not.toBeInTheDocument();
```

## Migration Path

### Phase 1: Add permissions to auth/me

1. Update backend to return permissions in `/auth/me`
2. Update frontend User type to include permissions
3. Deploy backend + frontend together

### Phase 2: Add permission checks

1. Wrap app in PermissionProvider
2. Add route-level guards to protect pages
3. Test with different user roles

### Phase 3: Refine UI

1. Add component-level guards to hide/show features
2. Update navigation to hide inaccessible sections
3. Add programmatic checks for complex logic

## Troubleshooting

### "usePermissions must be used within PermissionProvider"

**Solution:** Wrap your app in `<PermissionProvider>` at the root level.

### Permission checks always return false

**Solution:** Verify that:

1. Backend is returning permissions in `/auth/me`
2. Permissions array is not empty
3. Permission codes match exactly (case-sensitive)

### UI briefly shows then hides

**Solution:** This happens during loading. Add proper loading states:

```typescript
const { can, isLoading } = usePermissions();

if (isLoading) return <Skeleton />;
return can('users:read') ? <UserList /> : <AccessDenied />;
```

## Next Steps

1. Implement permission management UI (grant/revoke permissions)
2. Add group management (create groups, assign permissions to groups)
3. Add audit logging (track permission changes)
4. Implement role templates (predefined permission sets)

## Resources

- Permission types: `types/permission.ts`
- Permission utilities: `contexts/PermissionContext.tsx`
- Guard components: `components/guards/`
- Backend examples: See artifacts above
