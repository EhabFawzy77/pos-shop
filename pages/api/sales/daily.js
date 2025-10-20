import { connectToDatabase } from "../../../lib/mongodb";
import Sale from "../../../models/Sale";

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      date: { $gte: start, $lte: end },
    });

    const total = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
