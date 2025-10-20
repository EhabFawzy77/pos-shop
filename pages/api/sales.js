import { connectToDatabase } from "../../lib/mongodb";
import Sale from "../../models/Sale";

export default async function handler(req, res) {
  await connectToDatabase();

  // 🟢 جلب كل عمليات البيع
  if (req.method === "GET") {
    try {
      const sales = await Sale.find().sort({ date: -1 });
      return res.status(200).json(sales);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 🟢 إضافة عملية بيع جديدة (منتج واحد أو أكثر)
  if (req.method === "POST") {
    try {
      const { items, customer, total } = req.body;

      // لو جالك Array من العناصر (زي الكود القديم)
      if (Array.isArray(items)) {
        const saved = [];
        for (const i of items) {
          const sale = await Sale.create({
            item: i.item,
            price: i.price,
            quantity: i.quantity,
            total: i.total,
            customer,
          });
          saved.push(sale);
        }
        return res.status(201).json(saved);
      }

      // لو جالك عنصر واحد فقط (الكود الجديد)
      const sale = await Sale.create(req.body);
      return res.status(201).json(sale);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // ❌ أي ميثود غير GET و POST
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
