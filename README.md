Converted project: pos-shop-next

How to run locally:
1. Copy .env with:
   MONGODB_URI=your_mongo_connection_string
   MONGODB_DBNAME=your_db_name
2. npm install
3. npm run dev

API routes:
- GET /api/products
- POST /api/products
- GET /api/products/:id
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/sales
- POST /api/sales

Notes:
- Mongoose connection is in lib/mongodb.js
- Models in models/
- Static frontend copied into public/frontend
