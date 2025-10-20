import { connectToDatabase } from "../../lib/mongodb";
import Product from "../../models/Product";
export default async function handler(req, res) {
  await connectToDatabase();
  if (req.method === "GET") {
    const products = await Product.find().sort({ _id: -1 });
    return res.status(200).json(products);
  }
  if (req.method === "POST") {
    const { name, price, category } = req.body;
    const p = new Product({ name, price, category });
    await p.save();
    return res.status(201).json(p);
  }
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
