const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("transaction-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const filterSelect = document.getElementById("filter-category");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;


function generateID() {
  return Math.floor(Math.random() * 1000000);
}

function addTransaction(e) {
  e.preventDefault();
  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add text and amount");
    return;
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    category: category.value || "General",
  };

  transactions.push(transaction);
  updateLocalStorage();
  init();
  renderChart();

  form.reset();
}

function addTransactionDOM(transaction) {
  const currentFilter = filterSelect.value;
  if (currentFilter !== "all" && transaction.category !== currentFilter) return;

  const sign = transaction.amount < 0 ? "-" : "+";

  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
    ${transaction.text} (${transaction.category}) 
    <span>${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
    <button class="delete-btn" onclick="removeTransaction(${
      transaction.id
    })">×</button>
  `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((t) => t.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const inc = amounts
    .filter((x) => x > 0)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);
  const exp = amounts
    .filter((x) => x < 0)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);

  balance.innerText = total;
  income.innerText = inc;
  expense.innerText = Math.abs(exp).toFixed(2);
}

function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateCategoryOptions() {
  const categories = [...new Set(transactions.map((t) => t.category))];
  filterSelect.innerHTML = `<option value="all">All</option>`;
  categories.forEach((cat) => {
    filterSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

function downloadCSV() {
  const headers = "Description,Amount,Category\n";
  const rows = transactions
    .map((t) => `${t.text},${t.amount},${t.category}`)
    .join("\n");
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
}

function renderChart() {
  const dataMap = {};
  transactions.forEach((t) => {
    if (t.amount < 0) {
      dataMap[t.category] = (dataMap[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const data = {
    labels: Object.keys(dataMap),
    datasets: [
      {
        data: Object.values(dataMap),
        backgroundColor: [
          "#e74c3c",
          "#3498db",
          "#f1c40f",
          "#2ecc71",
          "#9b59b6",
        ],
      },
    ],
  };

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: data,
    options: { responsive: true },
  });
}

function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateCategoryOptions();
  setTimeout(renderChart, 50); // slight delay ensures DOM is updated
}

form.addEventListener("submit", addTransaction);
filterSelect.addEventListener("change", init);

init();
