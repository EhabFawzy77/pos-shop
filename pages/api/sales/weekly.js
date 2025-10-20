import { connectToDatabase } from "../../../lib/mongodb";
import Sale from "../../../models/Sale";

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const now = new Date();
    // السبت هو بداية الأسبوع (getDay() == 6)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    // احسب عدد الأيام للرجوع إلى السبت (إذا اليوم الإثنين (1)، نرجع 2 يوم للسبت)
    const daysToSaturday = (dayOfWeek + 1) % 7; // +1 لأن السبت هو 6
    startOfWeek.setDate(now.getDate() - daysToSaturday);
    startOfWeek.setHours(0, 0, 0, 0);

    // تحديد نهاية الأسبوع (الجمعة)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // الجمعة (6 أيام بعد السبت)
    endOfWeek.setHours(23, 59, 59, 999);

    // جلب المبيعات من السبت إلى الجمعة
    const sales = await Sale.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const total = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
