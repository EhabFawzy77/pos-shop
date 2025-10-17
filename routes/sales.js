const express = require("express");
const router = express.Router();
const Sale = require("../models/Sales");
const { startOfDay, endOfDay, startOfWeek, endOfWeek } = require("date-fns");

// GET all sales (كل الفواتير، بدون limit)
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 }); // كل الفواتير
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET daily income
router.get("/daily", async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const sales = await Sale.find({
      date: { $gte: todayStart, $lte: todayEnd },
    });
    const totalIncome = sales.reduce((sum, sale) => sum + sale.total, 0);
    const itemsSold = sales.flatMap((s) =>
      s.items.map((i) => ({ item: i.item, quantity: i.quantity }))
    );
    const summary = itemsSold.reduce((acc, item) => {
      acc[item.item] = (acc[item.item] || 0) + item.quantity;
      return acc;
    }, {});
    res.json({ totalIncome, itemsSold: summary, salesCount: sales.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET weekly income (من السبت للجمعة)
router.get("/weekly", async (req, res) => {
  try {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 }); // السبت
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 6 }); // الجمعة
    const sales = await Sale.find({ date: { $gte: weekStart, $lte: weekEnd } });
    const totalIncome = sales.reduce((sum, sale) => sum + sale.total, 0);
    res.json({ totalIncome, salesCount: sales.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET sale by ID
router.get("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new sale
router.post("/", async (req, res) => {
  const { items, customer, total } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: "يجب إضافة عناصر واحدة على الأقل" });
  }
  const sale = new Sale({ items, customer, total });
  try {
    const newSale = await sale.save();
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
