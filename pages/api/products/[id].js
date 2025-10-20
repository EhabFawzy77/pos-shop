import { connectToDatabase } from "/lib/mongodb";
import Product from "/models/Product";
export default async function handler(req, res) {
  await connectToDatabase();
  const { id } = req.query;
  if (req.method === "GET") {
    const p = await Product.findById(id);
    if (!p) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(p);
  }
  if (req.method === "PUT") {
    const updated = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE") {
    await Product.findByIdAndDelete(id);
    return res.status(204).end();
  }
  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
