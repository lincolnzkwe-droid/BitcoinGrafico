const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Busca histórico da CoinCap (sempre em USD)
async function fetchCryptoData(crypto, currency) {
  try {
    const url = `https://api.coincap.io/v2/assets/${crypto}/history?interval=h1`;
    const response = await fetch(url);
    const json = await response.json();
    const data = json.data;

    if (!data || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado:", json);
      return [];
    }

    // Busca taxa de conversão para BRL se necessário
    let rate = 1;
    if (currency === "BRL") {
      const fx = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL");
      const fxData = await fx.json();
      rate = fxData.rates.BRL || 1;
    }

    return data.map(p => ({
      time: new Date(p.time),
      value: parseFloat(p.priceUsd) * rate
    }));
  } catch (err) {
    console.error("❌ Erro ao buscar dados:", err);
    return [];
  }
}

// 🔹 Renderiza o gráfico
async function renderChart(crypto = "bitcoin", currency = "USD") {
  const data = await fetchCryptoData(crypto, currency);
  if (!data.length) return console.warn("⚠️ Nenhum dado disponível.");

  const labels = data.map(d => d.time.toLocaleString());
  const values = data.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crypto.toUpperCase()} em ${currency}`,
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

// 🔹 Atualiza ao clicar
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value.toLowerCase();
  const currency = document.getElementById("currency").value.toUpperCase();
  renderChart(crypto, currency);
});

// 🔹 Inicial
renderChart();
