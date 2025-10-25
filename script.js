const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Define o intervalo (1h candles, últimos 7 dias)
const LIMIT = 24 * 7; // 7 dias (24 horas por dia)

// 🔹 Função que busca dados da Binance
async function fetchCryptoData(crypto, currency) {
  try {
    // Ajusta o par conforme a moeda escolhida
    let symbol = "";
    if (currency === "BRL") {
      symbol = `${crypto}BRL`; // Exemplo: BTCBRL
    } else if (currency === "USD") {
      symbol = `${crypto}USDT`; // Exemplo: BTCUSDT
    }

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=${LIMIT}`;
    const response = await fetch(url);
    const data = await response.json();

    // Caso a Binance retorne erro (objeto e não array)
    if (!Array.isArray(data)) {
      console.error("⚠️ Erro da Binance:", data);
      alert(`O par ${symbol} não está disponível na Binance.`);
      return [];
    }

    return data.map(item => ({
      time: new Date(item[0]),
      value: parseFloat(item[4])
    }));

  } catch (error) {
    console.error("❌ Erro ao buscar dados da Binance:", error);
    alert("Erro ao conectar com a Binance. Verifique sua conexão.");
    return [];
  }
}

// 🔹 Renderiza o gráfico
async function renderChart(crypto = "BTC", currency = "USD") {
  const cryptoData = await fetchCryptoData(crypto, currency);
  if (!cryptoData.length) return;

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
      plugins: {
        legend: { labels: { color: "#c9d1d9" } },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: { ticks: { color: "#c9d1d9" } },
        y: { ticks: { color: "#c9d1d9" } }
      }
    }
  });
}

// 🔹 Atualiza ao clicar no botão
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value.toUpperCase();
  const currency = document.getElementById("currency").value.toUpperCase();
  renderChart(crypto, currency);
});

// 🔹 Renderização inicial
renderChart();
