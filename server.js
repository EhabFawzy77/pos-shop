const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cron = require("node-cron");
const { subDays, startOfWeek, endOfWeek } = require("date-fns"); // الأسبوع من السبت
const Sale = require("./models/Sales");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 60000, // 60 ثانية للاختيار
    socketTimeoutMS: 60000, // 60 ثانية للـ socket
    connectTimeoutMS: 30000, // 30 ثانية للـ connect
    maxPoolSize: 10,
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));
// Routes
app.use("/api/sales", require("./routes/sales"));
app.use("/api/products", require("./routes/products"));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Cron job: كل جمعة، احذف فواتير أقدم من 7 أيام (الأسبوع السبت-جمعة)
cron.schedule(
  "0 0 * * 5",
  async () => {
    // كل جمعة الساعة 12 صباحًا
    try {
      const weekAgo = subDays(new Date(), 7);
      const deleted = await Sale.deleteMany({ date: { $lt: weekAgo } });
      console.log(`تم حذف ${deleted.deletedCount} فاتورة قديمة`);
    } catch (err) {
      console.error("خطأ في الحذف:", err);
    }
  },
  { timezone: "Africa/Cairo" }
); // للتوقيت المصري

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
