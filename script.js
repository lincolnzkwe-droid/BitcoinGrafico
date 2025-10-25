const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Função: busca dados da Binance com proxy confiável (AllOrigins)
async function fetchCryptoData(crypto, currency) {
  try {
    // Mapeia pares válidos Binance
    const symbol =
      currency === "BRL"
        ? `${crypto}BRL` // Exemplo: BTCBRL
        : `${crypto}USDT`; // Exemplo: BTCUSDT (USD)

    // Usa proxy para evitar bloqueio CORS no GitHub Pages
    const target = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=168`;
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

    const response = await fetch(url);
    const wrapped = await response.json();

    // A resposta real vem dentro de wrapped.contents
    const data = JSON.parse(wrapped.contents);

    // Se não vier array, erro
    if (!Array.isArray(data) || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", data);
      return [];
    }

    // Formata dados para o gráfico
    return data.map(item => ({
      time: new Date(item[0]),
      value: parseFloat(item[4]),
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar dados da Binance:", error);
    return [];
  }
}

// 🔹 Função: desenha o gráfico
async function renderChart(crypto = "BTC", currency = "USD") {
  const cryptoData = await fetchCryptoData(crypto, currency);
  if (!cryptoData.length) return console.warn("⚠️ Nenhum dado disponível para renderizar o gráfico.");

  const labels = cryptoData.map(d => d.time.toLocaleString());
  const values = cryptoData.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${crypto}/${currency}`,
          data: values,
          borderColor: "#00ff99",
          backgroundColor: "rgba(0,255,153,0.1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#c9d1d9" } },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { ticks: { color: "#c9d1d9" } },
        y: { ticks: { color: "#c9d1d9" } },
      },
    },
  });
}

// 🔹 Botão de atualização
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value.toUpperCase();
  const currency = document.getElementById("currency").value.toUpperCase();
  renderChart(crypto, currency);
});

// 🔹 Carrega gráfico inicial
renderChart();
