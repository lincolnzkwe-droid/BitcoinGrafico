const ctx = document.getElementById("priceChart").getContext("2d");
const loading = document.getElementById("loading");
const priceElement = document.getElementById("currentPrice");
const changeElement = document.getElementById("changePercent");
let chart;

// 🔹 Define o número de horas por período
function getLimit(period) {
  switch (period) {
    case "1d": return 24;
    case "7d": return 24 * 7;
    case "30d": return 24 * 30;
    case "1y": return 24 * 365;
    default: return 168;
  }
}

// 🔹 Busca dados da Binance
async function fetchCryptoData(crypto, currency, period) {
  try {
    const limit = Math.min(getLimit(period), 1000);
    const symbol = (crypto + currency).toUpperCase();
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error("⚠️ Nenhum dado encontrado:", data);
      return [];
    }

    return data.map(item => ({
      time: new Date(item[0]),
      value: parseFloat(item[4])
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar dados da Binance:", error);
    return [];
  }
}

// 🔹 Atualiza valores no topo (preço atual + variação)
function updatePriceInfo(data) {
  if (data.length < 2) return;

  const last = data[data.length - 1].value;
  const first = data[0].value;
  const change = ((last - first) / first) * 100;

  priceElement.textContent = `$${last.toFixed(2)}`;
  changeElement.textContent = `${change.toFixed(2)}%`;

  if (change >= 0) {
    changeElement.classList.remove("negative");
    changeElement.textContent = `▲ +${change.toFixed(2)}%`;
  } else {
    changeElement.classList.add("negative");
    changeElement.textContent = `▼ ${change.toFixed(2)}%`;
  }
}

// 🔹 Renderiza o gráfico
async function renderChart(crypto = "BTC", currency = "USDT", period = "7d") {
  loading.style.display = "block";
  const cryptoData = await fetchCryptoData(crypto, currency, period);

  if (!cryptoData.length) {
    loading.textContent = "Nenhum dado encontrado.";
    return;
  }

  loading.style.display = "none";
  updatePriceInfo(cryptoData);

  const labels = cryptoData.map(d => d.time.toLocaleString());
  const values = cryptoData.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crypto}/${currency}`,
        data: values,
        borderColor: "#00ff99",
        backgroundColor: "rgba(0,255,153,0.1)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#c9d1d9" } },
        y: { ticks: { color: "#c9d1d9" } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false }
      }
    }
  });
}

// 🔹 Eventos dos botões de período
document.querySelectorAll(".period").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".period").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const crypto = document.getElementById("crypto").value.toUpperCase();
    const currency = document.getElementById("currency").value.toUpperCase();
    const period = btn.dataset.period;
    renderChart(crypto, currency, period);
  });
});

// 🔹 Botão "Atualizar"
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value.toUpperCase();
  const currency = document.getElementById("currency").value.toUpperCase();
  const activePeriod = document.querySelector(".period.active").dataset.period;
  renderChart(crypto, currency, activePeriod);
});

// 🔹 Renderização inicial
renderChart();
