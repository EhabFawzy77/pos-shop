import { connectToDatabase } from "../../../lib/mongodb";
import Sale from "../../../models/Sale";

export default async function handler(req, res) {
  await connectToDatabase();
  const { id } = req.query;

  try {
    const sale = await Sale.findById(id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
