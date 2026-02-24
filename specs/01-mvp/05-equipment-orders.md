# Spec 05: Equipment Orders — Catalog, Cart, Checkout

**Phase**: MVP
**Priority**: 5
**Estimated Time**: 16 hours
**Dependencies**: Spec 03 (Authentication) required

## Feature

Enable members to browse club equipment (branded gear, running shirts, etc.), add items to a shopping cart, and complete orders with shipping address collection and payment (manual or future integration).

## Goals

- Committee can manage product catalog (add, edit, delete items)
- Members can browse products with images, descriptions, and sizes
- Members can add products to cart and manage cart items
- Members can checkout with shipping address
- Orders tracked with status (pending, confirmed, shipped, delivered)
- Committee can view and manage orders (update status, print labels)
- Order notifications sent to customer and admin

## User Stories

1. **As a member**, I want to see club gear available for order so I can buy branded items.
2. **As a member**, I want to select size and quantity before adding to cart.
3. **As a member**, I want to review my cart and adjust quantities or remove items.
4. **As a member**, I want to provide my shipping address and place an order.
5. **As a member**, I want to see my order history and track order status.
6. **As a committee member**, I want to manage the product catalog (add new items, update prices).
7. **As a committee member**, I want to view all orders and mark them as shipped.

## Acceptance Criteria

- [ ] Products page (`/equipment`) lists all available products
- [ ] Product detail page shows: image, description, price, sizes, stock
- [ ] "Add to cart" button adds item with selected size/quantity
- [ ] Shopping cart page shows cart items with subtotal and total
- [ ] Cart persists in localStorage (until checkout)
- [ ] Checkout page collects: name, address, phone, email
- [ ] Order confirmation page shows order details and order ID
- [ ] Member orders page (`/orders`) shows all their orders with status
- [ ] Order detail page shows items, status, tracking info
- [ ] Committee products page (`/admin/products`) lists all products
- [ ] Committee can create new product (name, description, price, image, sizes, stock)
- [ ] Committee can edit product details
- [ ] Committee can delete product (soft delete preferred)
- [ ] Committee orders page (`/admin/orders`) shows all orders with filters
- [ ] Committee can update order status (pending, confirmed, shipped, delivered)
- [ ] Order confirmation email sent to customer
- [ ] Order received email sent to committee
- [ ] Tests: Cart logic, checkout flow, product management

## Technical Details

### Database Schema

```prisma
// prisma/schema.prisma (add to existing schema)

model Product {
  id            String    @id @default(cuid())
  name          String
  description   String?
  price         Float
  image         String?   // URL to product image
  sizes         String[]  // JSON array: ["XS", "S", "M", "L", "XL", "XXL"]
  stock         Int       // Total stock available
  sku           String?   @unique // Stock keeping unit
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  orderItems    OrderItem[]

  @@index([active])
}

model Order {
  id            String          @id @default(cuid())
  userId        String
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Shipping info
  shippingName  String
  shippingEmail String
  shippingPhone String
  shippingAddress String
  shippingCity  String
  shippingZip   String
  shippingCountry String @default("Belgium")

  // Order details
  items         OrderItem[]
  subtotal      Float
  shippingCost  Float     @default(0.0)
  tax           Float     @default(0.0)
  total         Float

  status        OrderStatus @default(PENDING)
  notes         String?

  // Tracking
  trackingNumber String?
  shippedAt     DateTime?
  deliveredAt   DateTime?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id            String    @id @default(cuid())
  orderId       String
  order         Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId     String
  product       Product   @relation(fields: [productId], references: [id])

  quantity      Int
  size          String?   // Selected size
  price         Float     // Price at time of order

  @@unique([orderId, productId, size])
}

enum OrderStatus {
  PENDING       // Just created, awaiting payment/confirmation
  CONFIRMED     // Committee confirmed, ready to ship
  SHIPPED       // Sent to member
  DELIVERED     // Delivered to member
  CANCELLED     // Cancelled by member or committee
}
```

### Frontend: Shopping Cart State

```typescript
// src/lib/cart.ts (to be created)

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface Cart {
  items: CartItem[];
  addItem: (productId: string, quantity: number, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clear: () => void;
}

// Store in localStorage with key "ladtc_cart"
export function useCart(): Cart {
  // Implementation using localStorage
}
```

### API Endpoints

#### Products (Public & Admin)

```
GET /api/products
  Query: ?active=true&skip=0&take=20
  Response: { products: Product[], total: number }

GET /api/products/[id]
  Response: { product: Product }

POST /api/products (admin only)
  Body: { name, description, price, sizes, stock, image, sku }
  Response: { product: Product }

PATCH /api/products/[id] (admin only)
  Body: { name?, description?, price?, sizes?, stock?, active? }
  Response: { product: Product }

DELETE /api/products/[id] (admin only)
  Response: { success: boolean }
```

#### Orders (Member & Admin)

```
GET /api/orders
  Response: { orders: Order[] } (member sees own orders)

POST /api/orders
  Body: { items: CartItem[], shippingName, shippingEmail, shippingAddress, ... }
  Response: { order: Order, orderId: string }

GET /api/orders/[id]
  Response: { order: Order } (member sees own, admin sees all)

PATCH /api/orders/[id] (admin only)
  Body: { status, trackingNumber, notes }
  Response: { order: Order }

DELETE /api/orders/[id] (admin only, soft delete)
  Response: { success: boolean }
```

### Equipment Pages Structure

**Products List Page (`/equipment`)**
```
Equipment Page:
  ├── Category filters (optional, future)
  ├── Sort by (price, name, newest)
  ├── Product grid (3 columns on desktop, 1 on mobile)
  │   ├── Product card
  │   │   ├── Image
  │   │   ├── Name
  │   │   ├── Price
  │   │   └── Add to cart button
  └── Pagination
```

**Product Detail Page (`/equipment/[id]`)**
```
Product Detail:
  ├── Large product image (with zoom, future)
  ├── Product info
  │   ├── Name
  │   ├── Price
  │   ├── Description
  │   ├── Size selector
  │   ├── Quantity selector
  │   ├── Stock status ("5 in stock" / "Out of stock")
  │   └── Add to cart button
  └── Related products (optional, future)
```

**Shopping Cart Page (`/equipment/cart`)**
```
Cart Page:
  ├── Cart items table
  │   ├── Product name
  │   ├── Size
  │   ├── Quantity (editable)
  │   ├── Price
  │   ├── Total
  │   └── Remove button
  ├── Cart summary
  │   ├── Subtotal
  │   ├── Shipping cost
  │   ├── Tax (if applicable)
  │   ├── Total
  │   └── Proceed to checkout button
  └── Continue shopping link
```

**Checkout Page (`/equipment/checkout`)**
```
Checkout:
  ├── Cart summary (right side)
  ├── Shipping info form (left side)
  │   ├── Full name
  │   ├── Email
  │   ├── Phone
  │   ├── Address
  │   ├── City
  │   ├── ZIP code
  │   └── Country (default: Belgium)
  └── Place order button
```

**Order Confirmation Page (`/equipment/order/[id]`)**
```
Order Confirmation:
  ├── "Thank you" message
  ├── Order ID
  ├── Order items summary
  ├── Total price
  ├── Shipping address
  ├── "Track order" link
  └── "Back to dashboard" link
```

**My Orders Page (`/orders`)**
```
My Orders:
  ├── Filter by status
  ├── Orders list
  │   ├── Order ID
  │   ├── Date
  │   ├── Items count
  │   ├── Total
  │   ├── Status
  │   └── View / Track button
  └── Pagination
```

**Order Detail Page (`/orders/[id]`)**
```
Order Detail:
  ├── Order info
  │   ├── Order ID
  │   ├── Date
  │   ├── Status
  │   └── Tracking number (if shipped)
  ├── Items table
  │   ├── Product name
  │   ├── Size
  │   ├── Quantity
  │   ├── Price
  │   └── Total
  ├── Totals (subtotal, shipping, tax, total)
  ├── Shipping address
  └── Contact support link
```

### Committee: Product Management

**Products List (`/admin/products`)**
```
Admin Products:
  ├── Create product button
  ├── Products table
  │   ├── Image
  │   ├── Name
  │   ├── Price
  │   ├── Stock
  │   ├── Active (toggle)
  │   └── Actions (edit, delete)
  └── Pagination
```

**Product Form (`/admin/products/new` and `/admin/products/[id]/edit`)**
```
Product Form:
  ├── Name
  ├── Description
  ├── Price
  ├── Image upload
  ├── Sizes (checkboxes or multi-select)
  ├── Stock quantity
  ├── SKU (optional)
  ├── Active toggle
  └── Save/Cancel buttons
```

### Committee: Order Management

**Orders List (`/admin/orders`)**
```
Admin Orders:
  ├── Filter by status
  ├── Filter by date range
  ├── Orders table
  │   ├── Order ID
  │   ├── Member name
  │   ├── Date
  │   ├── Items count
  │   ├── Total
  │   ├── Status
  │   └── Actions (view, edit, print label)
  └── Pagination
```

**Order Detail (`/admin/orders/[id]`)**
```
Admin Order Detail:
  ├── Order info (same as member view)
  ├── Status dropdown (change status)
  ├── Tracking number input
  ├── Notes textarea
  ├── Print shipping label button
  └── Cancel order button
```

## Implementation Files

1. **`src/components/ProductCard.tsx`** (new) — Product card component
2. **`src/components/ProductGrid.tsx`** (new) — Product grid layout
3. **`src/components/Cart.tsx`** (new) — Shopping cart display
4. **`src/components/CartItem.tsx`** (new) — Individual cart item
5. **`src/components/forms/CheckoutForm.tsx`** (new) — Checkout form
6. **`src/components/forms/ProductForm.tsx`** (new) — Product edit form
7. **`src/components/admin/OrderTable.tsx`** (new) — Order list table
8. **`src/app/(member)/equipment/page.tsx`** (new) — Products list
9. **`src/app/(member)/equipment/[id]/page.tsx`** (new) — Product detail
10. **`src/app/(member)/equipment/cart/page.tsx`** (new) — Shopping cart
11. **`src/app/(member)/equipment/checkout/page.tsx`** (new) — Checkout
12. **`src/app/(member)/orders/page.tsx`** (new) — My orders
13. **`src/app/(member)/orders/[id]/page.tsx`** (new) — Order detail
14. **`src/app/(admin)/products/page.tsx`** (new) — Product management
15. **`src/app/(admin)/products/new/page.tsx`** (new) — Create product
16. **`src/app/(admin)/products/[id]/edit/page.tsx`** (new) — Edit product
17. **`src/app/(admin)/orders/page.tsx`** (new) — Order management
18. **`src/app/(admin)/orders/[id]/page.tsx`** (new) — Order detail (admin)
19. **`src/hooks/useProducts.ts`** (new) — Product queries
20. **`src/hooks/useOrders.ts`** (new) — Order queries
21. **`src/hooks/useCart.ts`** (new) — Cart management
22. **`src/lib/cart.ts`** (new) — Cart utilities
23. **`src/app/api/products/route.ts`** (new) — List/create products
24. **`src/app/api/products/[id]/route.ts`** (new) — Get/update/delete product
25. **`src/app/api/orders/route.ts`** (new) — List/create orders
26. **`src/app/api/orders/[id]/route.ts`** (new) — Get/update order
27. **Tests**: `__tests__/cart.test.ts`, `__tests__/checkout.test.tsx`

## Validation Schemas (Zod)

```typescript
export const productSchema = z.object({
  name: z.string().min(3, "Product name required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  sizes: z.array(z.string()),
  stock: z.number().int().nonnegative(),
  image: z.string().url().optional(),
  sku: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2),
  shippingEmail: z.string().email(),
  shippingPhone: z.string().min(5),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingZip: z.string().min(2),
  shippingCountry: z.string().default("Belgium"),
});
```

## Testing

### Unit Tests
- Cart add/remove/update logic
- Price calculations
- Validation schemas

### Integration Tests
- Browse products
- Add to cart
- Checkout flow
- Order creation
- Committee can manage products
- Committee can manage orders

### Manual Testing
- Add multiple products to cart
- Change quantities
- Remove items
- Complete checkout
- View order confirmation
- Check order history
- Committee creates product
- Committee marks order as shipped
- Member receives confirmation email

## Dependencies

- Spec 03: Authentication (User model)
- TanStack Query for data fetching
- React Hook Form for forms
- Zod for validation

## Blockers

- PostgreSQL database with Prisma ORM must be set up
- Prisma migrations must be run

## Notes

- Cart stored in localStorage (simple, no backend required initially)
- Payment currently manual (committee receives orders and processes payment)
- Future: Integrate with Stripe/PayPal for automated payments
- Image upload: Use simple URL input (future: integrate with cloud storage)
- Shipping cost: Hardcoded in config (can be dynamic in future)
- Consider implementing discount codes (future feature)
- Consider batch print shipping labels (future, integration with carrier API)
