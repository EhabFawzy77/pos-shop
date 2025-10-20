// seed.js
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// رابط الاتصال بقاعدة البيانات
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DBNAME || "pos_shop";

if (!MONGODB_URI) {
  console.error(
    "❌ لم يتم العثور على MONGODB_URI، تأكد من وجوده في .env.local"
  );
  process.exit(1);
}

// موديل المنتج
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
});

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

// بيانات المنتجات
const products = [
  { product: "موبايل ك", price: 170 },
  { product: "شيل احمر", price: 120 },
  { product: "كالتيمه", price: 0 },
  { product: "رو والفك ابيض", price: 180 },
  { product: "منظار", price: 13 },
  { product: "تعلون", price: 150 },
  { product: "HD", price: 110 },
  { product: "تعاون سايب", price: 41 },
  { product: "لا 170 باور", price: 170 },
  { product: "موبايل سايب", price: 165 },
  { product: "با كم حاج", price: 120 },
  { product: "زين اكون", price: 0 },
  { product: "شعر اصفر", price: 7 },
  { product: "زيت فلفلينه", price: 7 },
  { product: "تروس", price: 110 },
  { product: "شهم اخضر", price: 130 },
  { product: "سياه تار", price: 0 },
  { product: "عيد ملاکی", price: 10 },
  { product: "تعبیر باقی", price: 3 },
  { product: "يد نقل", price: 150 },
  { product: "شطفه بلایی", price: 40 },
  { product: "نطفة العلا", price: 0 },
  { product: "نطر نقل", price: 0 },
  { product: "نخ نقل", price: 0 },
  { product: "عيل انقل", price: 120 },
  { product: "تصيبه فضل", price: 100 },
  { product: "شطفه نقل", price: 0 },
  { product: "عيل لكنه", price: 20 },
  { product: "ا نقل خله", price: 0 },
  { product: "شطفه مكنه", price: 0 },
  { product: "عيد تروسكل", price: 0 },
  { product: "قطعه در سال", price: 20 },
  { product: "نصير پا نقل", price: 90 },
  { product: "ميا توك توك", price: 40 },
  { product: "مطعه قول قول", price: 25 },
  { product: "شطفه ترسیل کامل", price: 30 },
  { product: "منطقه قول نول", price: 30 },
];

// دالة الإدخال
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");

    await Product.deleteMany({});
    console.log("🧹 تم حذف أي بيانات قديمة");

    const docs = products.map((p) => ({
      name: p.product,
      price: p.price,
    }));
    await Product.insertMany(docs);

    console.log(`✅ تم إدخال ${docs.length} منتج بنجاح`);
  } catch (err) {
    console.error("❌ خطأ أثناء الإدخال:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 تم فصل الاتصال بقاعدة البيانات");
  }
}

seed();
