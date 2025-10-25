const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Busca histórico da CoinGecko via proxy AllOrigins (para evitar CORS)
async function fetchCryptoData(crypto, currency) {
  try {
    const target = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=7&interval=hourly`;
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ${response.status}`);

    const wrapped = await response.json();
    const data = JSON.parse(wrapped.contents);

    if (!data.prices || data.prices.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", data);
      return [];
    }

    return data.prices.map(p => ({
      time: new Date(p[0]),
      value: p[1]
    }));

  } catch (error) {
    console.error("❌ Erro ao buscar dados CoinGecko (via proxy):", error);
    return [];
  }
}

// 🔹 Renderiza o gráfico
async function renderChart(crypto = "bitcoin", currency = "usd") {
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
        label: `${crypto.toUpperCase()} em ${currency.toUpperCase()}`,
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

// 🔹 Atualiza o gráfico
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value;
  const currency = document.getElementById("currency").value;
  renderChart(crypto, currency);
});

// 🔹 Renderização inicial
renderChart();
