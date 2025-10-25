const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Função para buscar dados históricos da Binance
async function fetchCryptoData(crypto, currency) {
  try {
    const symbol = (crypto + currency).toUpperCase();
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=168`;
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado:", data);
      return [];
    }

    return data.map(item => ({
      time: new Date(item[0]),
      value: parseFloat(item[4]) // preço de fechamento
    }));

  } catch (error) {
    console.error("❌ Erro ao buscar dados da Binance:", error);
    return [];
  }
}

// 🔹 Renderiza o gráfico
async function renderChart(crypto = "BTC", currency = "USDT") {
  const cryptoData = await fetchCryptoData(crypto, currency);

  if (!cryptoData.length) {
    console.error("⚠️ Nenhum dado disponível para renderizar o gráfico.");
    return;
  }

  const labels = cryptoData.map(d => d.time.toLocaleString());
  const values = cryptoData.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crypto}/${currency} — Últimos 7 dias`,
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
        legend: { labels: { color: "#c9d1d9" } },
        tooltip: { mode: "index", intersect: false }
      }
    }
  });
}

// 🔹 Atualiza o gráfico ao clicar no botão
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value.toUpperCase();
  const currency = document.getElementById("currency").value.toUpperCase();
  renderChart(crypto, currency);
});

// 🔹 Renderização inicial
renderChart();
