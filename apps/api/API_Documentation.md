# E-Store Backend API Documentation

Base URL: `http://localhost:4000/api`

All responses follow this format:

* Success: `{ ok: true, data... }`
* Error: `{ ok: false, error: "message" }`

---

## Authentication & User Management

### 1. Signup

`POST /auth/signup`

Body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "ok": true,
  "user": { "_id": "", "firstname": "", "lastname": "", "email": "", "role": "", "wishlist": [] },
  "cart": { "_id": "", "userId": "", "items": [], "status": "open" }
}
```

### 2. Login

`POST /auth/login`

Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "ok": true,
  "user": { "_id": "", "firstname": "", "lastname": "", "email": "", "role": "", "wishlist": [] },
  "cart": { "_id": "", "userId": "", "items": [{ "productId": "", "quantity": 1 }], "status": "open" }
}
```

Note: Sets `cart_token` cookie for guests and merges guest cart if it exists.

### 3. Logout

`POST /auth/logout`

Response:

```json
{ "ok": true, "message": "Logged out successfully" }
```

Note: Clears `cart_token` cookie.

### 4. Get User Profile

`GET /users/:userId`

Response:

```json
{ "ok": true, "user": { "_id": "", "firstname": "", "lastname": "", "email": "", "wishlist": [], "addresses": [] } }
```

### 5. Update User Profile

`PUT /users/:userId`

Body:

```json
{ "firstname": "NewName", "lastname": "NewLastName" }
```

Response:

```json
{ "ok": true, "user": { } }
```

### 6. Update Address

`PUT /users/:userId/address`

Body:

```json
{
  "type": "shipping",
  "address": {
    "fullName": "John Doe",
    "line1": "123 Main St",
    "line2": "Apt 4",
    "city": "Toronto",
    "state": "ON",
    "postalCode": "M5V 3A8",
    "country": "Canada"
  }
}
```

Response:

```json
{ "ok": true, "user": { } }
```

### 7. Add to Wishlist

`POST /users/:userId/wishlist`

Body:

```json
{ "productId": "64f5a8b9c..." }
```

Response:

```json
{ "ok": true, "user": { } }
```

### 8. Remove from Wishlist

`DELETE /users/:userId/wishlist/:productId`

Response:

```json
{ "ok": true, "user": { } }
```

### 9. Add Payment Method

`POST /users/:userId/payment-methods`

Body:

```json
{
  "cardBrand": "Visa",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "label": "Personal Visa",
  "isDefault": true
}
```

Response:

```json
{ "ok": true, "user": { } }
```

### 10. Remove Payment Method

`DELETE /users/:userId/payment-methods/:paymentId`

Response:

```json
{ "ok": true, "user": { } }
```

---

## Products

### 11. Get All Products

`GET /products`

Response:

```json
{ "ok": true, "products": [ { "_id": "", "name": "", "slug": "", "category": "", "brand": [], "price": 0, "stockQuantity": 0 } ] }
```

### 12. Get Product by ID

`GET /products/:productId`

Response:

```json
{ "ok": true, "product": { "_id": "", "name": "", "description": "", "specs": {}, "price": 0 } }
```

### 13. Search Products

`GET /products/search?keyword=dell`

Response:

```json
{ "ok": true, "products": [] }
```

### 14. Filter Products

`GET /products/filter?category=laptop&brand=Dell&minPrice=500&maxPrice=2000`

Query params: `category`, `brand`, `minPrice`, `maxPrice`

Response:

```json
{ "ok": true, "products": [] }
```

### 15. Sort Products

`GET /products/sort?sortBy=price&order=asc`

Query params: `sortBy` (price | name), `order` (asc | desc)

Response:

```json
{ "ok": true, "products": [] }
```

---

## Shopping Cart

### 16. Get Cart

`GET /cart/:userId`

For guests, use `guest` as `userId`.

Response:

```json
{ "ok": true, "cart": { "_id": "", "userId": "", "items": [], "status": "open" } }
```

### 17. Create Cart

`POST /cart`

Body:

```json
{ "userId": "64f5a8..." }
```

Response:

```json
{ "ok": true, "cart": { "_id": "", "items": [], "status": "open" } }
```

### 18. Add / Update Cart Item

`PUT /cart/:cartId/items`

Body:

```json
{ "productId": "64f5a8...", "quantity": 2 }
```

Response:

```json
{ "ok": true, "cart": { } }
```

### 19. Remove Cart Item

`DELETE /cart/:cartId/items/:productId`

Response:

```json
{ "ok": true, "cart": { } }
```

### 20. Clear Cart

`DELETE /cart/:cartId`

Response:

```json
{ "ok": true, "cart": { "items": [] } }
```

---

## Orders & Checkout

### 21. Create Order (Checkout)

`POST /orders`

Response:

```json
{ "ok": true, "order": { "orderStatus": "paid", "totalAmount": 0 } }
```

Note: Every 3rd payment is denied (mock processor). Inventory is reduced and cart is converted.

### 22. Get Order by ID

`GET /orders/:orderId`

Response:

```json
{ "ok": true, "order": { } }
```

### 23. Get User Orders

`GET /orders/user/:userId`

Response:

```json
{ "ok": true, "orders": [] }
```

---

## Admin - Order Management

### 26. Get All Orders

`GET /admin/orders`

Response:

```json
{ "ok": true, "orders": [] }
```

### 27. Filter Orders

`GET /admin/orders/filter`

Query params: `userId`, `productId`, `startDate`, `endDate`

Response:

```json
{ "ok": true, "orders": [] }
```

---

## Admin - User Management

### 28. Get All Users

`GET /admin/users`

Response:

```json
{ "ok": true, "users": [] }
```

### 29. Update User

`PUT /admin/users/:userId`

Response:

```json
{ "ok": true, "user": { } }
```

---

## Admin - Product Management

### 30. Create Product

`POST /admin/products`

Response:

```json
{ "ok": true, "product": { } }
```

### 31. Update Product

`PUT /admin/products/:productId`

Response:

```json
{ "ok": true, "product": { } }
```

### 32. Deactivate Product

`DELETE /admin/products/:productId`

Response:

```json
{ "ok": true, "product": { "isActive": false } }
```

---

## Admin - Inventory Management

### 33. Update Inventory

`PUT /admin/inventory/:productId`

Response:

```json
{ "ok": true, "product": { } }
```

### 34. Create Inventory Log

`POST /admin/inventory-logs`

Response:

```json
{ "ok": true, "log": { } }
```

### 35. Get Inventory Logs

`GET /admin/inventory-logs`

Response:

```json
{ "ok": true }
```
