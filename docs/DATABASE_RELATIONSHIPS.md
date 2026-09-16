# Database Schema Relationships

## Core Relationship Map

```text
┌─────────────────────────────────────────────────────────────────────┐
│                            TENANTS                                  │
│                         (isolation root)                            │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              │ 1:N
              ├────────────────┬──────────────────┬──────────────────┐
              │                │                  │                  │
         ┌─────────┐      ┌──────────┐      ┌───────────┐      ┌──────────┐
         │  USERS  │      │  GROUPS  │      │STOREFRONTS│      │ PRODUCTS │
         └─────────┘      └──────────┘      └───────────┘      └──────────┘
              │                │                 │                  │
              │ M:N            │ M:N             │ M:N              │ 1:N
              └────────┬───────┘                 │                  │
                       │                          │                  │
                ┌─────────────┐            ┌──────────────┐   ┌─────────────┐
                │USER_GROUPS  │            │STOREFRONT_   │   │PRODUCT_     │
                │             │            │PRODUCTS      │   │VARIANTS     │
                └─────────────┘            └──────────────┘   └─────────────┘


Relationships
-------------
TENANT      1 ────< USERS
TENANT      1 ────< GROUPS
TENANT      1 ────< STOREFRONTS
TENANT      1 ────< PRODUCTS

USERS       >────< GROUPS       (via USER_GROUPS)
STOREFRONTS >────< PRODUCTS     (via STOREFRONT_PRODUCTS)

PRODUCTS    1 ────< PRODUCT_VARIANTS
```

## Entity Relationships

### 1. **Tenant → Users** (1:N)

- One tenant has many users
- Users belong to exactly one tenant
- User `tenant_id` references `tenants.id`

### 2. **Tenant → Groups** (1:N)

- One tenant has many groups
- Groups belong to exactly one tenant
- Group `tenant_id` references `tenants.id`

### 3. **Tenant → Storefronts** (1:N)

- One tenant has many storefronts
- Storefronts belong to exactly one tenant
- Storefront `tenant_id` references `tenants.id`

### 4. **Tenant → Products** (1:N)

- One tenant has many products
- Products belong to exactly one tenant
- Product `tenant_id` references `tenants.id`

---

### 5. **Users ↔ Groups** (M:N via `user_groups`)

- Users can belong to multiple groups
- Groups can have multiple users
- Junction: `user_groups(user_id, group_id)`

### 6. **Users ↔ Permissions** (M:N via `user_permissions`)

- Users can have multiple direct permissions
- Permissions can be assigned to multiple users
- Junction: `user_permissions(user_id, permission_id)`

### 7. **Groups ↔ Permissions** (M:N via `group_permissions`)

- Groups can have multiple permissions
- Permissions can be assigned to multiple groups
- Junction: `group_permissions(group_id, permission_id)`

### 8. **Roles ↔ Permissions** (M:N via `role_permissions`)

- Roles are system-level (not assigned to users directly)
- Junction: `role_permissions(role_id, permission_id)`

---

### 9. **Storefronts ↔ Products** (M:N via `storefront_products`)

- Storefronts can contain multiple products
- Products can appear in multiple storefronts
- Junction: `storefront_products(storefront_id, product_id)`
- Stores `display_order` and `is_visible` for each relationship

### 10. **Products → Product_Variants** (1:N)

- One product has many variants
- Variants belong to exactly one product
- Variant `product_id` references `products.id`

---

### 11. **Users → Sessions** (1:N)

- One user has many sessions
- Sessions belong to exactly one user
- Session `user_id` references `users.id`

### 12. **Storefronts → Storefront_Designs** (1:N)

- One storefront has many designs (version history)
- Designs belong to exactly one storefront
- Design `storefront_id` references `storefronts.id`

### 13. **Users → Storefront_Designs** (1:N)

- One user can create many designs
- Design `created_by` references `users.id`

---

## Permission Inheritance Paths

```
USER
  ├── Direct Permissions (user_permissions)
  │   └── Permission
  │
  └── Groups (user_groups)
      └── Group Permissions (group_permissions)
          └── Permission

ROLE (system-level, admin only)
  └── Role Permissions (role_permissions)
      └── Permission
```

**Resolution Order:**

1. Direct user permissions (highest precedence)
2. Group permissions (inherited through groups)
3. Role permissions (system-level, root access)

## Foreign Key Constraints Summary

| Table                 | Foreign Key     | References          | On Delete  |
| --------------------- | --------------- | ------------------- | ---------- |
| `users`               | `tenant_id`     | `tenants(id)`       | `RESTRICT` |
| `users`               | `owner_id`      | `tenants(owner_id)` | `RESTRICT` |
| `groups`              | `tenant_id`     | `tenants(id)`       | `CASCADE`  |
| `storefronts`         | `tenant_id`     | `tenants(id)`       | `CASCADE`  |
| `products`            | `tenant_id`     | `tenants(id)`       | `CASCADE`  |
| `user_groups`         | `user_id`       | `users(id)`         | `RESTRICT` |
| `user_groups`         | `group_id`      | `groups(id)`        | `CASCADE`  |
| `user_permissions`    | `user_id`       | `users(id)`         | `CASCADE`  |
| `user_permissions`    | `permission_id` | `permissions(id)`   | `CASCADE`  |
| `group_permissions`   | `group_id`      | `groups(id)`        | `CASCADE`  |
| `group_permissions`   | `permission_id` | `permissions(id)`   | `CASCADE`  |
| `role_permissions`    | `role_id`       | `roles(id)`         | `CASCADE`  |
| `role_permissions`    | `permission_id` | `permissions(id)`   | `CASCADE`  |
| `storefront_products` | `storefront_id` | `storefronts(id)`   | `CASCADE`  |
| `storefront_products` | `product_id`    | `products(id)`      | `CASCADE`  |
| `product_variants`    | `product_id`    | `products(id)`      | `CASCADE`  |
| `sessions`            | `user_id`       | `users(id)`         | `CASCADE`  |
| `storefront_designs`  | `storefront_id` | `storefronts(id)`   | `CASCADE`  |
| `storefront_designs`  | `created_by`    | `users(id)`         | No cascade |

## Key Relationships Summary

**Primary Entities (6):**

- Tenant, User, Group, Permission, Storefront, Product

**Junction Tables (6):**

- user_groups, user_permissions, group_permissions, role_permissions, storefront_products, product_variants

**Supporting Tables (3):**

- Role, Session, Storefront_Design

**Core Relationship Pattern:**

- Tenant → Everything (data isolation)
- User ↔ Groups (group membership)
- User/Groups ↔ Permissions (authorization)
- Storefronts ↔ Products (catalog management)
- Products → Variants (product detail)
