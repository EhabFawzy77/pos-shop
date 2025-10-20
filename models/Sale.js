import mongoose from "mongoose";

// تعريف شكل كل عملية بيع (فاتورة واحدة لمنتج واحد)
const SaleSchema = new mongoose.Schema({
  item: String,
  price: Number,
  quantity: Number,
  total: Number,
  customer: String,
  date: { type: Date, default: Date.now, expires: "7d" }, // حذف تلقائي بعد 7 أيام
});

// تصدير الموديل
export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
