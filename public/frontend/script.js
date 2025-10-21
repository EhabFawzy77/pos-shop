const API_SALES = "/api/sales";
const API_PRODUCTS = "/api/products";
let products = [];
let currentInvoiceId = null;
let allInvoices = [];

// تبديل الوضع المظلم
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}
if (
  localStorage.theme === "dark" ||
  (!localStorage.theme &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
}

// فتح/إغلاق modal الفواتير
function toggleInvoicesModal() {
  const modal = document.getElementById("invoicesModal");
  modal.classList.toggle("hidden");
  if (!modal.classList.contains("hidden")) {
    modal.classList.add("modal-slide-in");
    loadInvoices();
    document.getElementById("searchInput").value = "";
  } else {
    modal.classList.remove("modal-slide-in");
  }
}

// Toast function لرسالة تم الحفظ
function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.remove("hidden");
  toast.classList.add("show");
  const progressBar = toast.querySelector(".progress-bar");
  progressBar.style.width = "100%";
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    progressBar.style.width = "0%";
    setTimeout(() => toast.classList.add("hidden"), 500);
  }, 3000);
}

function closeToast() {
  const toast = document.getElementById("toast");
  toast.classList.remove("show");
  toast.classList.add("hide");
  setTimeout(() => toast.classList.add("hidden"), 500);
}

// بحث في الفواتير
function searchInvoices() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const tbody = document.getElementById("invoicesTable");
  const filtered = allInvoices.filter((sale) => {
    const saleDate = new Date(sale.date)
      .toLocaleDateString("ar-EG")
      .toLowerCase();
    const firstItem = sale.item.toLowerCase();
    return saleDate.includes(query) || firstItem.includes(query);
  });
  tbody.innerHTML = filtered
    .map((sale, index) => {
      const saleDate = new Date(sale.date);
      const isToday = saleDate.toDateString() === new Date().toDateString();
      if (isToday) {
        return `
        <tr class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors fade-in" style="animation-delay: ${
          index * 0.05
        }s;" onclick="showInvoiceDetail('${sale._id}')">
          <td class="p-3 border border-gray-300 dark:border-gray-600">${
            sale.item
          }</td>
          <td class="p-3 border border-gray-300 dark:border-gray-600">${
            sale.quantity
          }</td>
          <td class="p-3 border border-gray-300 dark:border-gray-600">${
            sale.price
          } جنيه</td>
          <td class="p-3 border border-gray-300 dark:border-gray-600">${new Date(
            sale.date
          ).toLocaleDateString("ar-EG")}</td>
        </tr>
      `;
      } else {
        return `
        <tr class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors fade-in" style="animation-delay: ${
          index * 0.05
        }s;" onclick="showInvoiceDetail('${sale._id}')">
          <td colspan="3" class="p-3 border border-gray-300 dark:border-gray-600 text-center"></td>
          <td class="p-3 border border-gray-300 dark:border-gray-600 cursor-pointer text-blue-500 hover:text-blue-700">${new Date(
            sale.date
          ).toLocaleDateString("ar-EG")}</td>
        </tr>
      `;
      }
    })
    .join("");
}

// تحديث التاريخ والوقت
function updateDateTime() {
  const now = new Date();
  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  };
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formattedDate = now.toLocaleString("ar-EG", dateOptions);
  const formattedTime = now.toLocaleString("ar-EG", timeOptions);

  const dateElement = document.getElementById("currentDate");
  const timeElement = document.getElementById("currentTime");
  if (dateElement) dateElement.textContent = formattedDate;
  if (timeElement) timeElement.textContent = formattedTime;
}

setInterval(updateDateTime, 1000);

// استدعِ الدالة عند التحميل
document.addEventListener("DOMContentLoaded", () => {
  updateDateTime();
});

// الحصول على تاريخ اليوم
function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// تحميل المنتجات
async function loadProducts() {
  const loading = document.getElementById("productsLoading");
  const grid = document.getElementById("productsGrid");
  const noMsg = document.getElementById("noProductsMsg");
  loading.classList.remove("hidden");
  grid.classList.add("hidden");
  noMsg.classList.add("hidden");
  try {
    const res = await fetch(API_PRODUCTS);
    if (!res.ok) throw new Error("خطأ في التحميل");
    products = await res.json();
    loading.classList.add("hidden");
    if (products.length === 0) {
      noMsg.classList.remove("hidden");
      return;
    }
    grid.innerHTML = products
      .map(
        (p, index) => `
      <button class="grid-item bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-4 rounded-lg text-center font-bold text-sm h-24 shadow-md fade-in" style="animation-delay: ${
        index * 0.1
      }s;" data-item="${p.name}" data-price="${p.price}" title="اضغط لإضافة ${
          p.name
        }">
        ${p.name}<br><span class="text-xs">${p.price} جنيه</span>
      </button>
    `
      )
      .join("");
    grid.classList.remove("hidden");
    attachProductListeners();
  } catch (err) {
    loading.classList.add("hidden");
    alert("خطأ في تحميل المنتجات: " + err.message + ". تأكد من السيرفر.");
    noMsg.innerHTML =
      '<p class="text-red-500 dark:text-red-400">خطأ في التحميل. <button onclick="loadProducts()" class="underline">إعادة المحاولة</button></p>';
    noMsg.classList.remove("hidden");
  }
}

// حفظ المنتج مباشرة عند الضغط
async function saveProductSale(item, price) {
  const data = {
    item,
    price,
    quantity: 1,
    total: price,
    customer: "", // يمكن إضافة حقل العميل لاحقًا إذا لزم الأمر
  };
  try {
    await fetch(API_SALES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    loadInvoices();
    loadDailyIncome();
    loadWeeklyIncome();
    showToast();
    confettiBurst();
  } catch (err) {
    alert("خطأ في حفظ الفاتورة: " + err.message);
  }
}

function attachProductListeners() {
  document.querySelectorAll(".grid-item").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = btn.dataset.item;
      const price = parseFloat(btn.dataset.price);
      await saveProductSale(item, price);
    });
  });
}

// تحميل الفواتير في الـ modal
async function loadInvoices() {
  const loading = document.getElementById("invoicesLoading");
  const tbody = document.getElementById("invoicesTable");
  loading.classList.remove("hidden");
  try {
    const res = await fetch(API_SALES);
    const sales = await res.json();
    allInvoices = sales;
    loading.classList.add("hidden");
    const today = getTodayDate();
    tbody.innerHTML = sales
      .map((sale, index) => {
        const saleDate = new Date(sale.date);
        return `
      <tr class="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors fade-in" style="animation-delay: ${
        index * 0.05
      }s;" onclick="showInvoiceDetail('${sale._id}')">
        <td class="p-3 border border-gray-300 dark:border-gray-600">${
          sale.item
        }</td>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${
          sale.quantity
        }</td>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${
          sale.price
        } جنيه</td>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${new Date(
          sale.date
        ).toLocaleDateString("ar-EG")}</td>
      </tr>
    `;
      })
      .join("");
  } catch (err) {
    loading.classList.add("hidden");
    alert("خطأ في تحميل الفواتير: " + err.message);
  }
}

// عرض تفاصيل الفاتورة
async function showInvoiceDetail(id) {
  currentInvoiceId = id;
  const modal = document.getElementById("invoiceDetailModal");
  modal.classList.add("modal-slide-in");
  modal.classList.remove("hidden");
  const table = document.getElementById("invoiceDetailTable");
  const totalSpan = document.getElementById("invoiceTotal");

  try {
    const res = await fetch(`${API_SALES}/${id}`);
    const sale = await res.json();

    table.innerHTML = `
      <tr>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${sale.item}</td>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${sale.quantity}</td>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${sale.price} جنيه</td>
        <td class="p-3 border border-gray-300 dark:border-gray-600">${sale.total} جنيه</td>
      </tr>
    `;
    totalSpan.textContent = sale.total;
  } catch (err) {
    alert("خطأ في تحميل التفاصيل: " + err.message);
  }
}

window.closeInvoiceModal = () => {
  const modal = document.getElementById("invoiceDetailModal");
  modal.classList.add("hidden");
  modal.classList.remove("modal-slide-in");
};

// Confetti function
function confettiBurst() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-10px";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = "1000";
    confetti.style.animation = "fall 3s linear forwards";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

// تحميل الإجمالي اليومي
async function loadDailyIncome() {
  try {
    const res = await fetch(`${API_SALES}/daily`);
    const data = await res.json();
    const total = data.total || data.totalIncome || 0;
    document.getElementById("dailyIncome").textContent = total;
  } catch (err) {
    console.error("خطأ في تحميل إجمالي اليوم:", err);
  }
}
setInterval(loadDailyIncome, 60000);
loadDailyIncome();

// تحميل الإجمالي الأسبوعي
async function loadWeeklyIncome() {
  try {
    const res = await fetch(`${API_SALES}/weekly`);
    const data = await res.json();
    const total = data.total || data.totalIncome || 0;
    document.getElementById("weeklyIncome").textContent = total;
  } catch (err) {
    console.error("خطأ في تحميل إجمالي الأسبوع:", err);
  }
}
setInterval(loadWeeklyIncome, 60000);
loadWeeklyIncome();

window.toggleProductsModal = () => {
  const modal = document.getElementById("productsModal");
  modal.classList.toggle("hidden");
  if (!modal.classList.contains("hidden")) {
    modal.classList.add("modal-slide-in");
    loadProductsTable();
  } else {
    modal.classList.remove("modal-slide-in");
  }
};

async function loadProductsTable() {
  const tbody = document.getElementById("productsTable");
  tbody.innerHTML = products
    .map(
      (p, index) => `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors fade-in" style="animation-delay: ${
      index * 0.1
    }s;">
      <td class="p-3 border border-gray-300 dark:border-gray-600">${p.name}</td>
      <td class="p-3 border border-gray-300 dark:border-gray-600">${
        p.price
      }</td>
      <td class="p-3 border border-gray-300 dark:border-gray-600">${
        p.category
      }</td>
      <td class="p-3 border border-gray-300 dark:border-gray-600">
        <button onclick="editProduct('${
          p._id
        }')" class="text-blue-500 mr-3 hover:text-blue-700 transition-colors" title="تعديل">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteProduct('${
          p._id
        }')" class="text-red-500 hover:text-red-700 transition-colors" title="حذف">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("productForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("productId").value;
      const data = {
        name: document.getElementById("productName").value,
        price: parseFloat(document.getElementById("productPrice").value),
        category: document.getElementById("productCategory").value,
      };
      try {
        if (id) {
          await fetch(`${API_PRODUCTS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } else {
          await fetch(API_PRODUCTS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        }
        loadProducts();
        loadProductsTable();
        e.target.reset();
        document.getElementById("productId").value = "";
      } catch (err) {
        alert("خطأ: " + err.message);
      }
    });

  window.editProduct = (id) => {
    const p = products.find((pr) => pr._id === id);
    if (p) {
      document.getElementById("productId").value = p._id;
      document.getElementById("productName").value = p.name;
      document.getElementById("productPrice").value = p.price;
      document.getElementById("productCategory").value = p.category;
    }
  };

  window.deleteProduct = async (id) => {
    if (confirm("تأكيد الحذف؟")) {
      try {
        await fetch(`${API_PRODUCTS}/${id}`, { method: "DELETE" });
        loadProducts();
        loadProductsTable();
      } catch (err) {
        alert("خطأ: " + err.message);
      }
    }
  };

  // تحميل أولي
  loadProducts();
});
