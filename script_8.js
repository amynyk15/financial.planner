document.addEventListener("DOMContentLoaded", () => {
  // 全局数据存储 (用于同步)
  let globalData = {
    incomes: [],
    expenses: [],
    goals: [],
    products: [],
    folders: [],
    creditCards: [
      {
        holder: "Stefania Nord",
        number: "•••• •••• •••• 7899",
        expiry: "05/24",
        balance: 1425,
        type: "VISA", // 新增：信用卡类型，默认VISA
      },
    ],
    user: { name: "Stefania Nord", avatar: "https://via.placeholder.com/40" },
    budgetByMonth: {}, // { '2025-1': { incomes: [], expenses: [] } }
    accounts: [
      // 新增：Other Accounts数据
      { name: "Salary", number: "••••• 2305", balance: 503 },
      { name: "Virtual cash account", number: "Cash", balance: 849 },
      { name: "Credit Card", number: "••••• 2305", balance: 34 },
      { name: "Savings", number: "••••• 1207", balance: 15000 },
    ],
    categories: {
      // 新增：自定义子类别
      income: [],
      expenses: [],
      savings: [],
    },
    bills: [], // 新增：Bill Payment Tracker数据 {name, dueDate, amount, paid: false}
  };

  // 从 localStorage 加载数据
  function loadData() {
    const savedData = JSON.parse(localStorage.getItem("financeData")) || {};
    globalData = { ...globalData, ...savedData };
    updateAllUI();
  }

  // 保存到 localStorage
  function saveData() {
    localStorage.setItem("financeData", JSON.stringify(globalData));
    updateAllUI();
  }

  // 更新所有 UI (同步数据)
  function updateAllUI() {
    updateBudgetSummary();
    updateDashboardSummary();
    updateSidebarSummary();
    updateUserProfile();
    renderGoals(); // 同步到 Dashboard 和 Savings
    renderAccounts(); // 新增：渲染账户
    renderTransactions(); // 新增：同步渲染交易
    renderCustomCategories(); // 新增：渲染自定义类别
    renderBills(); // 新增：渲染帐单
  }

  // 更新用户资料
  function updateUserProfile() {
    document.getElementById("user-name").textContent = globalData.user.name;
    document.getElementById("user-avatar").src = globalData.user.avatar;
  }

  // 更新 Dashboard 汇总
  function updateDashboardSummary() {
    const totalIncome = globalData.incomes.reduce(
      (sum, i) => sum + i.amount,
      0
    );
    const totalExpenses = globalData.expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );
    const balance = totalIncome - totalExpenses;

    document.getElementById(
      "dashboard-balance"
    ).textContent = `$${balance.toFixed(2)}`;
    document.getElementById(
      "chart-income"
    ).textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById(
      "chart-expenses"
    ).textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById("chart-balance").textContent = `$${balance.toFixed(
      2
    )}`;

    // 同步信用卡 (显示第一张)
    if (globalData.creditCards.length > 0) {
      const card = globalData.creditCards[0];
      document.getElementById("card-holder").textContent = card.holder;
      document.getElementById("card-number").textContent = card.number;
      document.getElementById("card-expiry").textContent = card.expiry;
      document.getElementById(
        "card-balance"
      ).textContent = `$${card.balance.toFixed(2)}`;
      document.getElementById("card-type").textContent = card.type; // 新增：更新卡类型
    }
  }

  // 更新侧边栏汇总
  function updateSidebarSummary() {
    const totalIncome = globalData.incomes.reduce(
      (sum, i) => sum + i.amount,
      0
    );
    const totalExpenses = globalData.expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );
    const balance = totalIncome - totalExpenses;

    document.getElementById(
      "sidebar-total-income"
    ).textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById(
      "sidebar-total-expenses"
    ).textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById(
      "sidebar-balance"
    ).textContent = `$${balance.toFixed(2)}`;
  }

  // 1. 页面切换逻辑
  const navLinks = document.querySelectorAll(".sidebar-menu a");
  const pages = document.querySelectorAll(".page");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // 移除所有active类
      navLinks.forEach((l) => l.classList.remove("active"));
      pages.forEach((p) => p.classList.remove("active"));

      // 添加active类
      link.classList.add("active");
      const targetId = link.getAttribute("href");
      document.querySelector(targetId).classList.add("active");

      // 页面特定加载
      if (targetId === "#budget") loadBudgetForMonth();
      if (targetId === "#savings") renderGoals();
      if (targetId === "#shopping") renderShopping();
      if (targetId === "#settings") loadSettings();
      if (targetId === "#accounts") renderAccounts(); // 新增：加载Accounts页面
      if (targetId === "#expenses") renderTransactions(); // 新增：加载Expenses页面
      if (targetId === "#bills") renderBills(); // 新增：加载Bills页面
    });
  });

  // 2. 初始化支出图表
  const ctx = document.getElementById("expenseChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1", "5", "10", "15", "20", "25", "30"],
      datasets: [
        {
          label: "Balance",
          data: [1000, 1200, 900, 1500, 1300, 1800, 1978.5],
          borderColor: "#8A7CFB",
          backgroundColor: "rgba(138, 124, 251, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Expenses",
          data: [800, 1000, 1200, 900, 1100, 800, 600],
          borderColor: "#FFB74D",
          backgroundColor: "rgba(255, 183, 77, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: $${context.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value;
            },
          },
        },
      },
    },
  });

  // 3. 预算规划器逻辑 (优化: 分年月)
  const addIncomeBtn = document.querySelector(".add-income");
  const addExpenseBtn = document.querySelector(".add-expense");
  const incomeList = document.querySelector(".income-list");
  const expenseList = document.querySelector(".expense-list");
  const totalIncomeEl = document.getElementById("total-income");
  const totalExpensesEl = document.getElementById("total-expenses");
  const projectedSavingsEl = document.getElementById("projected-savings");
  const budgetYearSelect = document.getElementById("budget-year");
  const budgetMonthSelect = document.getElementById("budget-month");

  // 动态填充年份 (当前年 ±5)
  for (
    let y = new Date().getFullYear() - 5;
    y <= new Date().getFullYear() + 5;
    y++
  ) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    budgetYearSelect.appendChild(option);
  }
  budgetYearSelect.value = new Date().getFullYear();
  budgetMonthSelect.value = new Date().getMonth() + 1;

  // 加载指定年月预算
  function loadBudgetForMonth() {
    const key = `${budgetYearSelect.value}-${budgetMonthSelect.value}`;
    const monthData = globalData.budgetByMonth[key] || {
      incomes: [],
      expenses: [],
    };
    globalData.incomes = monthData.incomes;
    globalData.expenses = monthData.expenses;
    renderIncomeList();
    renderExpenseList();
    updateBudgetSummary();
  }

  // 保存当前预算到年月
  function saveBudgetForMonth() {
    const key = `${budgetYearSelect.value}-${budgetMonthSelect.value}`;
    globalData.budgetByMonth[key] = {
      incomes: globalData.incomes,
      expenses: globalData.expenses,
    };
    saveData();
  }

  budgetYearSelect.addEventListener("change", loadBudgetForMonth);
  budgetMonthSelect.addEventListener("change", loadBudgetForMonth);

  // 添加收入
  addIncomeBtn.addEventListener("click", () => {
    const sourceInput = document.querySelector(
      '.budget-section:first-child input[type="text"]'
    );
    const amountInput = document.querySelector(
      '.budget-section:first-child input[type="number"]'
    );

    const source = sourceInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!source || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid income source and amount");
      return;
    }

    globalData.incomes.push({ source, amount });
    renderIncomeList();
    sourceInput.value = "";
    amountInput.value = "";
    updateBudgetSummary();
    saveBudgetForMonth();
  });

  // 添加支出
  addExpenseBtn.addEventListener("click", () => {
    const categorySelect = document.getElementById("expense-category-select"); // 修改：使用动态select
    const amountInput = document.querySelector(
      '.budget-section:nth-child(2) input[type="number"]'
    );

    const category = categorySelect.value;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid expense amount");
      return;
    }

    globalData.expenses.push({ category, amount });
    renderExpenseList();
    amountInput.value = "";
    updateBudgetSummary();
    saveBudgetForMonth();
  });

  // 渲染收入列表
  function renderIncomeList() {
    incomeList.innerHTML = "";
    globalData.incomes.forEach((item, index) => {
      const incomeItem = document.createElement("div");
      incomeItem.className = "transaction-item";
      incomeItem.innerHTML = `
                <span>${item.source}</span>
                <span class="amount income">+$${item.amount.toFixed(2)}</span>
                <button class="more-btn delete-income"><i class="fas fa-trash"></i></button>
            `;
      incomeItem
        .querySelector(".delete-income")
        .addEventListener("click", () => {
          globalData.incomes.splice(index, 1);
          renderIncomeList();
          updateBudgetSummary();
          saveBudgetForMonth();
        });
      incomeList.appendChild(incomeItem);
    });
  }

  // 渲染支出列表
  function renderExpenseList() {
    expenseList.innerHTML = "";
    globalData.expenses.forEach((item, index) => {
      const expenseItem = document.createElement("div");
      expenseItem.className = "transaction-item";
      expenseItem.innerHTML = `
                <span>${item.category}</span>
                <span class="amount expense">-$${item.amount.toFixed(2)}</span>
                <button class="more-btn delete-expense"><i class="fas fa-trash"></i></button>
            `;
      expenseItem
        .querySelector(".delete-expense")
        .addEventListener("click", () => {
          globalData.expenses.splice(index, 1);
          renderExpenseList();
          updateBudgetSummary();
          saveBudgetForMonth();
        });
      expenseList.appendChild(expenseItem);
    });
  }

  // 更新预算汇总
  function updateBudgetSummary() {
    const totalIncome = globalData.incomes.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalExpenses = globalData.expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const projectedSavings = totalIncome - totalExpenses;

    totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
    projectedSavingsEl.textContent = `$${projectedSavings.toFixed(2)}`;

    if (projectedSavings >= 0) {
      projectedSavingsEl.style.color = "#4CAF50";
    } else {
      projectedSavingsEl.style.color = "#FF5252";
    }
  }

  // 4. 实际支出页面逻辑
  const addTransactionBtn = document.getElementById("add-transaction-btn");
  const transactionForm = document.querySelector(".transaction-form");
  const closeTransactionForm = transactionForm.querySelector(".close-form");
  const saveTransactionBtn = transactionForm.querySelector(".save-transaction");
  const actualTransactionsList = document.getElementById(
    "actual-transactions-list"
  );

  // 打开交易表单
  addTransactionBtn.addEventListener("click", () => {
    transactionForm.classList.remove("hidden");
  });

  // 关闭交易表单
  closeTransactionForm.addEventListener("click", () => {
    transactionForm.classList.add("hidden");
  });

  // 保存交易 (同步到全局 incomes/expenses，并渲染同步)
  saveTransactionBtn.addEventListener("click", () => {
    const dateInput = document.getElementById("transaction-date");
    const typeSelect = document.getElementById("transaction-type");
    const descInput = document.getElementById("transaction-desc");
    const categorySelect = document.getElementById("transaction-category");
    const accountSelect = document.getElementById("transaction-account");
    const amountInput = document.getElementById("transaction-amount");

    const date = dateInput.value;
    const type = typeSelect.value;
    const description = descInput.value.trim();
    const category = categorySelect.value;
    const account = accountSelect.value;
    const amount = parseFloat(amountInput.value);

    if (!date || !description || isNaN(amount) || amount <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    // 同步到全局 (添加date等字段)
    if (type === "income") {
      globalData.incomes.push({
        source: description,
        amount,
        date,
        category,
        account,
      });
    } else {
      globalData.expenses.push({
        category,
        amount,
        date,
        description,
        account,
      });
    }
    saveData();
    renderTransactions(); // 同步渲染

    // 清空表单并关闭
    dateInput.value = "";
    descInput.value = "";
    amountInput.value = "";
    transactionForm.classList.add("hidden");
  });

  // 新增：支援編輯交易功能
  let editingTransactionIndex = null; // 記錄正在編輯的交易索引
  let editingTransactionType = null; // 'income' 或 'expense'

  // 修改：當點擊 Edit 按鈕時，載入資料到表單並標記為編輯模式
  function bindEditEvents() {
    document.querySelectorAll(".edit-transaction").forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const transactions = [
          ...globalData.incomes.map((i) => ({
            ...i,
            type: "income",
            description: i.source || i.description,
          })),
          ...globalData.expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        const trans = transactions[index];
        if (!trans) return;

        // 記錄正在編輯的索引和類型
        editingTransactionIndex = index;
        editingTransactionType = trans.type;

        // 填入表單
        document.getElementById("transaction-date").value = trans.date || "";
        document.getElementById("transaction-type").value = trans.type;
        document.getElementById("transaction-desc").value =
          trans.description || trans.source || "";
        document.getElementById("transaction-category").value =
          trans.category || "";
        document.getElementById("transaction-account").value =
          trans.account || "";
        document.getElementById("transaction-amount").value =
          trans.amount || "";

        // 打開表單
        transactionForm.classList.remove("hidden");

        // 可選：改變標題表示編輯模式
        transactionForm.querySelector("h3").textContent = "Edit Transaction";
      });
    });
  }

  // 修改：儲存交易時，判斷是新增還是編輯
  saveTransactionBtn.addEventListener("click", () => {
    const date = document.getElementById("transaction-date").value;
    const type = document.getElementById("transaction-type").value;
    const description = document
      .getElementById("transaction-desc")
      .value.trim();
    const category = document.getElementById("transaction-category").value;
    const account = document.getElementById("transaction-account").value;
    const amount = parseFloat(
      document.getElementById("transaction-amount").value
    );

    if (!date || !description || isNaN(amount) || amount <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    const transactionData = { date, description, category, account, amount };

    if (editingTransactionIndex !== null && editingTransactionType) {
      // 編輯模式：更新原有資料
      if (editingTransactionType === "income") {
        // 找到對應的 income 並更新（用 description + amount + date 近似匹配，或改用 id 更精準）
        const incomes = globalData.incomes;
        const oldTrans = [
          ...incomes.map((i) => ({
            ...i,
            type: "income",
            description: i.source,
          })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date))[
          editingTransactionIndex
        ];
        const incomeIndex = incomes.findIndex(
          (i) =>
            i.source === oldTrans.description &&
            i.amount === oldTrans.amount &&
            i.date === oldTrans.date
        );
        if (incomeIndex >= 0) {
          incomes[incomeIndex] = {
            source: description,
            amount,
            date,
            category,
            account,
          };
        }
      } else {
        const expenses = globalData.expenses;
        const oldTrans = [
          ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date))[
          editingTransactionIndex
        ];
        const expenseIndex = expenses.findIndex(
          (e) =>
            e.description === oldTrans.description &&
            e.amount === oldTrans.amount &&
            e.date === oldTrans.date
        );
        if (expenseIndex >= 0) {
          expenses[expenseIndex] = {
            category,
            amount,
            date,
            description,
            account,
          };
        }
      }
      editingTransactionIndex = null;
      editingTransactionType = null;
      transactionForm.querySelector("h3").textContent = "Add New Transaction"; // 恢復標題
    } else {
      // 新增模式
      if (type === "income") {
        globalData.incomes.push({
          source: description,
          amount,
          date,
          category,
          account,
        });
      } else {
        globalData.expenses.push({
          category,
          amount,
          date,
          description,
          account,
        });
      }
    }

    saveData();
    renderTransactions(); // 同步渲染

    // 清空表单并关闭
    document.getElementById("transaction-date").value = "";
    document.getElementById("transaction-desc").value = "";
    document.getElementById("transaction-amount").value = "";
    transactionForm.classList.add("hidden");
  });

  // 渲染交易 (同步到 Expenses 和 Dashboard)
  function renderTransactions() {
    // 合併 incomes 和 expenses，排序按日期降序
    const transactions = [
      ...globalData.incomes.map((i) => ({
        date: i.date,
        description: i.source || i.description,
        category: i.category || "Income",
        account: i.account,
        amount: i.amount,
        type: "income",
      })),
      ...globalData.expenses.map((e) => ({
        date: e.date,
        description: e.description,
        category: e.category,
        account: e.account,
        amount: -e.amount,
        type: "expense",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Expenses 頁面渲染 (完整表格)
    actualTransactionsList.innerHTML = "";
    transactions.forEach((trans, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${trans.date || "N/A"}</td>
        <td>${trans.description}</td>
        <td>${trans.category}</td>
        <td>${trans.account || "N/A"}</td>
        <td class="${trans.type}">${
        trans.type === "income" ? "+" : "-"
      }$${Math.abs(trans.amount).toFixed(2)}</td>
        <td>
          <button class="btn small-btn edit-transaction"><i class="fas fa-edit"></i></button>
          <button class="btn small-btn delete-transaction"><i class="fas fa-trash"></i></button>
        </td>
      `;
      row.querySelector(".delete-transaction").addEventListener("click", () => {
        if (trans.type === "income") {
          globalData.incomes = globalData.incomes.filter(
            (i) =>
              i.source !== trans.description ||
              i.amount !== Math.abs(trans.amount) ||
              i.date !== trans.date
          );
        } else {
          globalData.expenses = globalData.expenses.filter(
            (e) =>
              e.description !== trans.description ||
              e.amount !== Math.abs(trans.amount) ||
              e.date !== trans.date
          );
        }
        saveData();
      });
      actualTransactionsList.appendChild(row);
    });
    bindEditEvents(); // 綁定編輯事件

    // Dashboard 最近交易 (前5筆)
    const dashboardTransactions = document.getElementById(
      "dashboard-transactions-list"
    );
    dashboardTransactions.innerHTML = "";
    transactions.slice(0, 5).forEach((trans) => {
      const item = document.createElement("div");
      item.className = "transaction-item";
      item.innerHTML = `
        <span class="date">${trans.date || "N/A"}</span>
        <span class="merchant"><i class="fas fa-store"></i> ${
          trans.description
        }</span>
        <span class="category">${trans.category}</span>
        <span class="account">${trans.account || "N/A"}</span>
        <span class="amount ${trans.type}">${
        trans.type === "income" ? "+" : "-"
      }$${Math.abs(trans.amount).toFixed(2)}</span>
        <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
      `;
      dashboardTransactions.appendChild(item);
    });
  }

  // 5. 储蓄目标页面逻辑
  const addGoalBtn = document.getElementById("add-goal-btn");
  const goalForm = document.querySelector(".goal-form");
  const closeGoalForm = goalForm.querySelector(".close-form");
  const saveGoalBtn = goalForm.querySelector(".save-goal");
  const goalsGrid = document.querySelector(".goals-grid");

  addGoalBtn.addEventListener("click", () => {
    goalForm.classList.remove("hidden");
  });

  closeGoalForm.addEventListener("click", () => {
    goalForm.classList.add("hidden");
  });

  saveGoalBtn.addEventListener("click", () => {
    const name = document.getElementById("goal-name").value.trim();
    const target = parseFloat(document.getElementById("goal-target").value);
    const current = parseFloat(document.getElementById("goal-current").value);
    const deadline = document.getElementById("goal-deadline").value;

    if (!name || isNaN(target) || target <= 0 || isNaN(current)) {
      alert("Please fill in all required fields correctly");
      return;
    }

    globalData.goals.push({ name, target, current, deadline });
    renderGoals();
    saveData();

    // 清空表单
    document.getElementById("goal-name").value = "";
    document.getElementById("goal-target").value = "";
    document.getElementById("goal-current").value = "";
    document.getElementById("goal-deadline").value = "";
    goalForm.classList.add("hidden");
  });

  // 渲染目标 (同步到 Savings 和 Dashboard)
  function renderGoals() {
    // Savings 頁面
    goalsGrid.innerHTML = "";
    globalData.goals.forEach((goal, index) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      const card = document.createElement("div");
      card.className = "goal-card";
      card.innerHTML = `
        <div class="progress-circle" style="--progress: ${progress}">${progress.toFixed(
        0
      )}%</div>
        <div class="goal-details">
          <h3>${goal.name}</h3>
          <p class="target">Target: $${goal.target.toFixed(2)}</p>
          <p class="saved">Saved: $${goal.current.toFixed(2)}</p>
          <p class="deadline">${
            goal.deadline ? `Deadline: ${goal.deadline}` : ""
          }</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="goal-actions">
            <button class="btn small-btn edit-goal"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn small-btn delete-goal"><i class="fas fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
      card.querySelector(".delete-goal").addEventListener("click", () => {
        globalData.goals.splice(index, 1);
        renderGoals();
        saveData();
      });
      goalsGrid.appendChild(card);
    });

    // Dashboard 同步 (前2個)
    const dashboardGoals = document.getElementById("dashboard-goals-list");
    dashboardGoals.innerHTML = "";
    globalData.goals.slice(0, 2).forEach((goal) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      const item = document.createElement("div");
      item.className = "goal-item";
      item.innerHTML = `
        <div class="progress-circle" style="--progress: ${progress}"><span>${progress.toFixed(
        0
      )}%</span></div>
        <div class="goal-info">
          <h4>${goal.name}</h4>
          <p>$${goal.current.toFixed(2)} / $${goal.target.toFixed(2)}</p>
        </div>
      `;
      dashboardGoals.appendChild(item);
    });
  }

  // 6. 购物清单页面逻辑 (包含文件夹和拖拽)
  const addProductBtn = document.getElementById("add-product-btn");
  const productForm = document.querySelector(".product-form");
  const closeProductForm = productForm.querySelector(".close-form");
  const saveProductBtn = productForm.querySelector(".save-product");
  const photoPreview = document.getElementById("photo-preview");
  const shoppingGrid = document.querySelector(".shopping-grid");
  const createFolderBtn = document.getElementById("create-folder-btn");
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const closeModal = document.querySelector(".close-modal");
  const folderView = document.querySelector(".folder-view");
  const folderViewTitle = document.getElementById("folder-view-title");
  const folderProductsGrid = document.querySelector(".folder-products-grid");
  const returnToMainBtn = document.querySelector(".return-to-main");
  const toggleMainListBtn = document.getElementById("toggle-main-list");

  addProductBtn.addEventListener("click", () => {
    productForm.classList.remove("hidden");
  });

  closeProductForm.addEventListener("click", () => {
    productForm.classList.add("hidden");
  });

  document.getElementById("product-photo").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview.innerHTML = `<img src="${e.target.result}" alt="Product preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  saveProductBtn.addEventListener("click", () => {
    const name = document.getElementById("product-name").value.trim();
    const category = document.getElementById("product-category").value.trim();
    const price = parseFloat(document.getElementById("product-price").value);
    const qty = parseInt(document.getElementById("product-qty").value);
    const file = document.getElementById("product-photo").files[0];

    if (!name || isNaN(price) || price <= 0 || isNaN(qty) || qty < 1) {
      alert("Please fill in all required fields correctly");
      return;
    }

    const product = { name, category, price, qty, folderId: null };
    if (file) {
      product.photoUrl = URL.createObjectURL(file);
    }
    globalData.products.push(product);
    renderShopping();
    saveData();

    // 清空表单
    document.getElementById("product-name").value = "";
    document.getElementById("product-category").value = "";
    document.getElementById("product-price").value = "";
    document.getElementById("product-qty").value = "1";
    document.getElementById("product-photo").value = "";
    photoPreview.innerHTML = "";
    productForm.classList.add("hidden");
  });

  // 创建文件夹
  createFolderBtn.addEventListener("click", () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      globalData.folders.push({
        id: Date.now(),
        name: folderName,
        products: [],
      });
      renderShopping();
      saveData();
    }
  });

  // 渲染购物清单 (文件夹 + 未分组产品)
  function renderShopping() {
    shoppingGrid.innerHTML = "";

    // 渲染文件夹
    globalData.folders.forEach((folder) => {
      const folderCard = document.createElement("div");
      folderCard.className = "folder-card";
      const folderProducts = globalData.products.filter(
        (p) => p.folderId === folder.id
      );
      let previewHtml = '<div class="folder-preview">';
      if (folderProducts.length === 0) {
        previewHtml += '<p class="empty-folder">Empty</p>';
      } else {
        folderProducts.slice(0, 3).forEach((p, idx) => {
          previewHtml += p.photoUrl
            ? `<img src="${p.photoUrl}" alt="${p.name}">`
            : "";
        });
      }
      previewHtml += "</div>";
      folderCard.innerHTML = `
        <h3>${folder.name}</h3>
        ${previewHtml}
        <button class="delete-folder-btn"><i class="fas fa-trash"></i></button>
      `;

      // 点击跳转到详细视图
      folderCard.addEventListener("click", (e) => {
        if (e.target.closest(".delete-folder-btn")) return; // 避免删除按钮触发跳转
        showFolderView(folder);
      });

      // 拖拽目标事件
      folderCard.addEventListener("dragover", (e) => {
        e.preventDefault();
        folderCard.classList.add("over");
      });
      folderCard.addEventListener("dragleave", () => {
        folderCard.classList.remove("over");
      });
      folderCard.addEventListener("drop", (e) => {
        e.preventDefault();
        folderCard.classList.remove("over");
        const productId = e.dataTransfer.getData("text/plain");
        const product = globalData.products.find((p) => p.name === productId); // 使用 name 作为 id (简化)
        if (product) {
          product.folderId = folder.id;
          renderShopping();
          saveData();
        }
      });

      // 新增：删除文件夹
      folderCard
        .querySelector(".delete-folder-btn")
        .addEventListener("click", () => {
          if (confirm(`Delete folder "${folder.name}" and its contents?`)) {
            // 移除文件夹内产品
            globalData.products = globalData.products.filter(
              (p) => p.folderId !== folder.id
            );
            // 移除文件夹
            globalData.folders = globalData.folders.filter(
              (f) => f.id !== folder.id
            );
            renderShopping();
            saveData();
          }
        });

      shoppingGrid.appendChild(folderCard);
    });

    // 渲染未分组产品 (在文件夹以下)
    const ungroupedContainer = document.createElement("div");
    ungroupedContainer.className = "ungrouped-products";
    globalData.products
      .filter((p) => !p.folderId)
      .forEach((product) => {
        ungroupedContainer.appendChild(createProductCard(product));
      });
    shoppingGrid.appendChild(ungroupedContainer);
  }

  // 新增：显示文件夹详细视图
  function showFolderView(folder) {
    folderViewTitle.textContent = `${folder.name} Details`;
    folderProductsGrid.innerHTML = "";

    const folderProducts = globalData.products.filter(
      (p) => p.folderId === folder.id
    );
    folderProducts.forEach((product) => {
      folderProductsGrid.appendChild(createProductCard(product, true)); // 详细模式
    });

    // 切换视图
    shoppingGrid.classList.add("hidden");
    folderView.classList.remove("hidden");
  }

  // 新增：返回主视图
  returnToMainBtn.addEventListener("click", () => {
    shoppingGrid.classList.remove("hidden");
    folderView.classList.add("hidden");
    renderShopping();
  });

  // 创建产品卡片 (支持拖拽和图片放大，详细模式显示资料)
  function createProductCard(product, detailed = false) {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.draggable = true;
    productCard.dataset.productId = product.name; // 使用 name 作为 id

    let photoHtml =
      '<div class="product-image"><i class="fas fa-image" style="font-size: 3rem; color: #ccc;"></i></div>';
    if (product.photoUrl) {
      photoHtml = `<img src="${product.photoUrl}" alt="${product.name}" class="product-image" data-src="${product.photoUrl}">`;
    }

    productCard.innerHTML = `
            ${photoHtml}
            ${
              detailed
                ? `
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">$${product.price.toFixed(2)} x ${
                    product.qty
                  } = $${(product.price * product.qty).toFixed(2)}</p>
                <div class="goal-actions">
                    <button class="btn small-btn edit-product"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn small-btn delete-product"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
            `
                : "" // 主视图不显示详细资料
            }
        `;

    // 拖拽开始
    productCard.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", product.name);
      productCard.classList.add("dragging");
    });
    productCard.addEventListener("dragend", () => {
      productCard.classList.remove("dragging");
    });

    // 图片放大
    const productImage = productCard.querySelector(".product-image");
    if (productImage && product.photoUrl) {
      productImage.addEventListener("click", () => {
        imageModal.style.display = "flex";
        modalImage.src = productImage.getAttribute("data-src");
        modalImage.alt = product.name;
      });
    }

    if (detailed) {
      // 删除商品
      productCard
        .querySelector(".delete-product")
        .addEventListener("click", () => {
          if (product.photoUrl) URL.revokeObjectURL(product.photoUrl);
          globalData.products = globalData.products.filter(
            (p) => p.name !== product.name
          );
          renderShopping();
          saveData();
        });

      // 编辑商品
      productCard
        .querySelector(".edit-product")
        .addEventListener("click", () => {
          document.getElementById("product-name").value = product.name;
          document.getElementById("product-category").value = product.category;
          document.getElementById("product-price").value = product.price;
          document.getElementById("product-qty").value = product.qty;
          if (product.photoUrl) {
            photoPreview.innerHTML = `<img src="${product.photoUrl}" alt="Product preview">`;
          }
          productForm.classList.remove("hidden");
          // 移除旧的
          globalData.products = globalData.products.filter(
            (p) => p.name !== product.name
          );
        });
    }

    return productCard;
  }

  // 关闭图片弹窗
  closeModal.addEventListener("click", () => {
    imageModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === imageModal) {
      imageModal.style.display = "none";
    }
  });

  // 新增：拉出主列表 (toggle shopping-grid显示)
  toggleMainListBtn.addEventListener("click", () => {
    shoppingGrid.classList.toggle("hidden");
  });

  // Dashboard 信用卡编辑
  const editCreditBtn = document.querySelector(".edit-credit-card");
  const creditForm = document.getElementById("credit-form");
  const closeCreditForm = creditForm.querySelector(".close-form");
  const saveCreditBtn = creditForm.querySelector(".save-credit");

  editCreditBtn.addEventListener("click", () => {
    // 加载第一张卡数据
    if (globalData.creditCards.length > 0) {
      const card = globalData.creditCards[0];
      document.getElementById("credit-holder").value = card.holder;
      document.getElementById("credit-number").value = card.number.replace(
        /•/g,
        ""
      );
      document.getElementById("credit-type").value = card.type; // 新增：加载类型
      document.getElementById("credit-expiry").value = card.expiry;
      document.getElementById("credit-balance").value = card.balance;
    }
    creditForm.classList.remove("hidden");
  });

  closeCreditForm.addEventListener("click", () => {
    creditForm.classList.add("hidden");
  });

  saveCreditBtn.addEventListener("click", () => {
    const holder = document.getElementById("credit-holder").value.trim();
    const number = document.getElementById("credit-number").value.trim();
    const type = document.getElementById("credit-type").value; // 新增：保存类型
    const expiry = document.getElementById("credit-expiry").value.trim();
    const balance = parseFloat(document.getElementById("credit-balance").value);

    if (!holder || !number || !expiry || isNaN(balance)) {
      alert("Please fill in all fields correctly");
      return;
    }

    // 掩码卡号
    const maskedNumber = number.replace(/\d(?=\d{4})/g, "•");

    globalData.creditCards[0] = {
      holder,
      number: maskedNumber,
      type, // 新增
      expiry,
      balance,
    }; // 只支持一张，覆盖
    updateDashboardSummary();
    saveData();
    creditForm.classList.add("hidden");
  });

  // Settings 页面逻辑
  const saveSettingsBtn = document.querySelector(".save-settings");
  const settingsIconInput = document.getElementById("settings-icon");
  const settingsPreview = document.getElementById("settings-preview");

  function loadSettings() {
    document.getElementById("settings-name").value = globalData.user.name;
    if (globalData.user.avatar) {
      settingsPreview.innerHTML = `<img src="${globalData.user.avatar}" alt="Preview">`;
    }
    renderCustomCategories(); // 新增：加载自定义类别
  }

  settingsIconInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        settingsPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

  saveSettingsBtn.addEventListener("click", () => {
    const name = document.getElementById("settings-name").value.trim();
    const file = settingsIconInput.files[0];

    if (name) globalData.user.name = name;
    if (file) {
      globalData.user.avatar = URL.createObjectURL(file);
    }
    saveData();
  });

  // 新增：自定义子类别逻辑
  const addSubCategoryBtn = document.querySelector(".add-sub-category");
  addSubCategoryBtn.addEventListener("click", () => {
    const type = document.getElementById("category-type").value;
    const name = document.getElementById("sub-category-name").value.trim();
    if (!name) {
      alert("Please enter a sub-category name");
      return;
    }
    globalData.categories[type].push(name);
    saveData();
    renderCustomCategories();
    // 动态更新相关select (例如expenses)
    const expenseSelect = document.getElementById("expense-category-select");
    expenseSelect.innerHTML = ""; // 清空
    [
      ...globalData.categories.expenses,
      "Cafes & Restaurants",
      "Groceries",
      "Transport",
      "Entertainment",
      "Utilities",
    ].forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      expenseSelect.appendChild(option);
    });
  });

  // 渲染自定义类别列表
  function renderCustomCategories() {
    const incomeList = document.getElementById("income-categories-list");
    const expensesList = document.getElementById("expenses-categories-list");
    const savingsList = document.getElementById("savings-categories-list");

    incomeList.innerHTML = "";
    globalData.categories.income.forEach((cat, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${cat} <button class="delete-category"><i class="fas fa-trash"></i></button>`;
      li.querySelector(".delete-category").addEventListener("click", () => {
        globalData.categories.income.splice(index, 1);
        saveData();
        renderCustomCategories();
      });
      incomeList.appendChild(li);
    });

    expensesList.innerHTML = "";
    globalData.categories.expenses.forEach((cat, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${cat} <button class="delete-category"><i class="fas fa-trash"></i></button>`;
      li.querySelector(".delete-category").addEventListener("click", () => {
        globalData.categories.expenses.splice(index, 1);
        saveData();
        renderCustomCategories();
      });
      expensesList.appendChild(li);
    });

    savingsList.innerHTML = "";
    globalData.categories.savings.forEach((cat, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${cat} <button class="delete-category"><i class="fas fa-trash"></i></button>`;
      li.querySelector(".delete-category").addEventListener("click", () => {
        globalData.categories.savings.splice(index, 1);
        saveData();
        renderCustomCategories();
      });
      savingsList.appendChild(li);
    });
  }

  // 新增：Accounts页面逻辑
  const addAccountBtn = document.getElementById("add-account-btn");
  const accountForm = document.getElementById("account-form");
  const closeAccountForm = accountForm.querySelector(".close-form");
  const saveAccountBtn = accountForm.querySelector(".save-account");
  let editingAccountIndex = -1;

  addAccountBtn.addEventListener("click", () => {
    editingAccountIndex = -1;
    accountForm.classList.remove("hidden");
    document.getElementById("account-name").value = "";
    document.getElementById("account-number").value = "";
    document.getElementById("account-balance").value = "";
  });

  closeAccountForm.addEventListener("click", () => {
    accountForm.classList.add("hidden");
  });

  saveAccountBtn.addEventListener("click", () => {
    const name = document.getElementById("account-name").value.trim();
    const number = document.getElementById("account-number").value.trim();
    const balance = parseFloat(
      document.getElementById("account-balance").value
    );

    if (!name || !number || isNaN(balance)) {
      alert("Please fill in all fields correctly");
      return;
    }

    const account = { name, number, balance };

    if (editingAccountIndex >= 0) {
      globalData.accounts[editingAccountIndex] = account;
    } else {
      globalData.accounts.push(account);
    }

    renderAccounts();
    saveData();
    accountForm.classList.add("hidden");
  });

  // 渲染账户 (用于Accounts和Dashboard)
  function renderAccounts() {
    // Accounts页面
    const accountsList = document.getElementById("accounts-list");
    accountsList.innerHTML = "";
    globalData.accounts.forEach((acc, index) => {
      const item = document.createElement("div");
      item.className = "account-item";
      item.innerHTML = `
        <div class="account-info">
          <i class="fas fa-university"></i>
          <div>
            <p>${acc.name}</p>
            <p class="account-number">${acc.number}</p>
          </div>
        </div>
        <p class="account-balance">$${acc.balance.toFixed(2)}</p>
        <div>
          <button class="btn small-btn edit-account"><i class="fas fa-edit"></i></button>
          <button class="btn small-btn delete-account"><i class="fas fa-trash"></i></button>
        </div>
      `;
      item.querySelector(".edit-account").addEventListener("click", () => {
        editingAccountIndex = index;
        document.getElementById("account-name").value = acc.name;
        document.getElementById("account-number").value = acc.number;
        document.getElementById("account-balance").value = acc.balance;
        accountForm.classList.remove("hidden");
      });
      item.querySelector(".delete-account").addEventListener("click", () => {
        globalData.accounts.splice(index, 1);
        renderAccounts();
        saveData();
      });
      accountsList.appendChild(item);
    });

    // Dashboard同步
    const dashboardAccounts = document.getElementById(
      "dashboard-accounts-list"
    );
    dashboardAccounts.innerHTML = "";
    globalData.accounts.forEach((acc) => {
      const item = document.createElement("div");
      item.className = "account-item";
      item.innerHTML = `
        <div class="account-info">
          <i class="fas fa-university"></i>
          <div>
            <p>${acc.name}</p>
            <p class="account-number">${acc.number}</p>
          </div>
        </div>
        <p class="account-balance">$${acc.balance.toFixed(2)}</p>
      `;
      dashboardAccounts.appendChild(item);
    });
  }

  // 新增：Bill Payment Tracker 逻辑
  const addBillBtn = document.getElementById("add-bill-btn");
  const billForm = document.querySelector(".bill-form");
  const closeBillForm = billForm.querySelector(".close-form");
  const saveBillBtn = billForm.querySelector(".save-bill");
  let editingBillIndex = -1;

  addBillBtn.addEventListener("click", () => {
    editingBillIndex = -1;
    billForm.querySelector("h3").textContent = "Add Bill";
    document.getElementById("bill-name").value = "";
    document.getElementById("bill-due-date").value = "";
    document.getElementById("bill-amount").value = "";
    document.getElementById("bill-paid").checked = false;
    billForm.classList.remove("hidden");
  });

  closeBillForm.addEventListener("click", () => {
    billForm.classList.add("hidden");
  });

  saveBillBtn.addEventListener("click", () => {
    const name = document.getElementById("bill-name").value.trim();
    const dueDate = document.getElementById("bill-due-date").value;
    const amount = parseFloat(document.getElementById("bill-amount").value);
    const paid = document.getElementById("bill-paid").checked;

    if (!name || !dueDate || isNaN(amount) || amount <= 0) {
      alert("Please fill in all fields correctly");
      return;
    }

    const bill = { name, dueDate, amount, paid };

    if (editingBillIndex >= 0) {
      globalData.bills[editingBillIndex] = bill;
      editingBillIndex = -1;
    } else {
      globalData.bills.push(bill);
    }

    renderBills();
    saveData();
    billForm.classList.add("hidden");
  });

  // 新增：渲染帐单 (Bills页面和Dashboard Upcoming)
  function renderBills() {
    const today = new Date();
    const billsList = document.getElementById("bills-list");
    billsList.innerHTML = "";

    // 排序：未付先，按dueDate升序
    const sortedBills = [...globalData.bills].sort((a, b) => {
      if (a.paid && !b.paid) return 1;
      if (!a.paid && b.paid) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    sortedBills.forEach((bill, index) => {
      const due = new Date(bill.dueDate);
      const timeDiff = due - today;
      const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let status = bill.paid ? "Paid" : "Unpaid";
      let statusClass = bill.paid ? "paid" : "unpaid";
      let remainingText = "";

      if (!bill.paid) {
        if (remainingDays === 0) {
          status = "Today";
          statusClass = "today";
        } else if (remainingDays < 0) {
          status = "Overdue";
          statusClass = "overdue";
          remainingText = ` (${Math.abs(remainingDays)} days overdue)`;
        } else {
          remainingText = ` (${remainingDays} days left)`;
        }
      }

      const isAlert = !bill.paid && (remainingDays <= 3 || remainingDays < 0);

      const card = document.createElement("div");
      card.className = `bill-card ${isAlert ? "alert" : ""}`;
      card.innerHTML = `
        <h3>${bill.name}</h3>
        <p>Due Date: ${bill.dueDate}</p>
        <p>Amount: $${bill.amount.toFixed(2)}</p>
        <p>Status: <span class="bill-status ${statusClass}">${status}</span>${remainingText}</p>
        <div class="bill-actions">
          <button class="btn small-btn edit-bill"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn small-btn delete-bill"><i class="fas fa-trash"></i> Delete</button>
        </div>
      `;

      card.querySelector(".edit-bill").addEventListener("click", () => {
        editingBillIndex = index;
        billForm.querySelector("h3").textContent = "Edit Bill";
        document.getElementById("bill-name").value = bill.name;
        document.getElementById("bill-due-date").value = bill.dueDate;
        document.getElementById("bill-amount").value = bill.amount;
        document.getElementById("bill-paid").checked = bill.paid;
        billForm.classList.remove("hidden");
      });

      card.querySelector(".delete-bill").addEventListener("click", () => {
        globalData.bills.splice(index, 1);
        renderBills();
        saveData();
      });

      billsList.appendChild(card);
    });

    // Dashboard Upcoming Bills (未付且 <=7天，最多3个)
    const dashboardUpcoming = document.getElementById(
      "dashboard-upcoming-bills"
    );
    dashboardUpcoming.innerHTML = "";
    const upcomingBills = sortedBills
      .filter(
        (b) =>
          !b.paid &&
          Math.ceil((new Date(b.dueDate) - today) / (1000 * 60 * 60 * 24)) <= 7
      )
      .slice(0, 3);
    if (upcomingBills.length === 0) {
      dashboardUpcoming.innerHTML = "<p>No upcoming bills.</p>";
    } else {
      upcomingBills.forEach((bill) => {
        const item = document.createElement("div");
        item.className = "upcoming-bill-item";
        item.innerHTML = `
          <p class="bill-name">${bill.name}</p>
          <p class="bill-due">${bill.dueDate}</p>
          <p class="bill-amount">$${bill.amount.toFixed(2)}</p>
        `;
        dashboardUpcoming.appendChild(item);
      });
    }
  }

  // 初始化
  loadData();
  updateBudgetSummary();
  renderGoals();
  renderShopping();
  renderTransactions(); // 新增
  renderAccounts(); // 新增
  renderBills(); // 新增
});

  // ==================== 資料匯出 / 匯入功能 ====================
  const exportBtn = document.getElementById("export-data-btn");
  const importInput = document.getElementById("import-data-input");
  const importStatus = document.getElementById("import-status");

  // 匯出資料
  exportBtn?.addEventListener("click", () => {
    const dataStr = JSON.stringify(globalData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;

    // 檔名帶日期，方便辨識
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    link.download = `finance-backup-${dateStr}.json`;

    link.click();
    URL.revokeObjectURL(url);

    // 可選：給使用者一點回饋
    alert("Data exported successfully!");
  });

  // 匯入資料
  importInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      importStatus.textContent = "Please select a valid JSON file.";
      importStatus.style.color = "var(--danger)";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // 簡單驗證：至少要有 user 欄位
        if (!importedData.user) {
          throw new Error("Invalid backup file");
        }

        // 直接覆蓋 globalData
        Object.assign(globalData, importedData);

        // 強制重新渲染所有 UI
        updateAllUI();
        saveData(); // 立即存入 localStorage

        importStatus.textContent = "Data imported successfully! Page will reload.";
        importStatus.style.color = "var(--success)";

        // 重新載入頁面確保一切乾淨
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        importStatus.textContent = "Import failed: Invalid or corrupted file.";
        importStatus.style.color = "var(--danger)";
        console.error(err);
      }
    };

    reader.readAsText(file);
    // 重置 input 以便同檔可重複匯入
    e.target.value = "";
  });

// 新增：讓 Dashboard 內所有 class="show-more" 的跳轉連結也能正確切換頁面
document.querySelectorAll('a.show-more[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = link.getAttribute("href"); // 例如 "#expenses" 或 "#savings" 或 "#accounts"
    const targetPage = document.querySelector(targetId);

    if (targetPage) {
      // 移除所有側邊欄高亮
      document
        .querySelectorAll(".sidebar-menu a")
        .forEach((l) => l.classList.remove("active"));

      // 移除所有頁面顯示
      document
        .querySelectorAll(".page")
        .forEach((p) => p.classList.remove("active"));

      // 高亮對應的側邊欄選項（讓視覺一致）
      const sidebarLink = document.querySelector(
        `.sidebar-menu a[href="${targetId}"]`
      );
      if (sidebarLink) {
        sidebarLink.classList.add("active");
      }

      // 顯示目標頁面
      targetPage.classList.add("active");
    } else {
      console.error(`找不到頁面：${targetId}，請確認 section id 是否正確`);
    }
  });

  // 自動產生 Budget Planner 年份選單（解決年份錯亂問題）
document.addEventListener('DOMContentLoaded', function() {
  const yearSelect = document.getElementById('budget-year');
  if (!yearSelect) return;

  // 清空原有選項（避免重複）
  yearSelect.innerHTML = '';

  // 以今年為基準，前後各加 5 年（可自行調整）
  const currentYear = new Date().getFullYear(); // 自動取得目前年份（2025）
  const startYear = currentYear - 5;
  const endYear = currentYear + 5;

  // 從新到舊加入選項（最新年在最上面）
  for (let year = endYear; year >= startYear; year--) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    // 如果是今年，預設選取它
    if (year === currentYear) {
      option.selected = true;
    }
    yearSelect.appendChild(option);
  }
});
});

