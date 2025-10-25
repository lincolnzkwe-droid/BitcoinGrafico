const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Busca histórico da CoinCap (em USD sempre)
async function fetchCryptoData(crypto) {
  try {
    const end = Date.now();
    const start = end - 7 * 24 * 60 * 60 * 1000; // últimos 7 dias
    const url = `https://api.coincap.io/v2/assets/${crypto}/history?interval=h1&start=${start}&end=${end}`;
    const response = await fetch(url);
    const json = await response.json();
    const data = json.data;

    if (!data || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", json);
      return [];
    }

    return data.map(p => ({
      time: new Date(p.time),
      value: parseFloat(p.priceUsd)
    }));

  } catch (error) {
    console.error("❌ Erro ao buscar dados CoinCap:", error);
    return [];
  }
}

// 🔹 Busca taxa de câmbio para BRL ou EUR
async function getExchangeRate(toCurrency) {
  if (toCurrency === "usd") return 1; // já em USD

  try {
    const url = `https://api.exchangerate.host/latest?base=USD&symbols=${toCurrency.toUpperCase()}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.rates[toCurrency.toUpperCase()] || 1;
  } catch (error) {
    console.error("Erro ao buscar taxa de câmbio:", error);
    return 1;
  }
}

// 🔹 Renderiza o gráfico
async function renderChart(crypto = "bitcoin", currency = "usd") {
  const cryptoData = await fetchCryptoData(crypto);
  if (!cryptoData.length) return console.error("⚠️ Nenhum dado disponível para renderizar o gráfico.");

  // Converte valores conforme moeda selecionada
  const rate = await getExchangeRate(currency);
  const convertedData = cryptoData.map(d => ({
    time: d.time,
    value: d.value * rate
  }));

  const labels = convertedData.map(d => d.time.toLocaleString());
  const values = convertedData.map(d => d.value);

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

// 🔹 Atualiza o gráfico quando clicar em "Atualizar"
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value;
  const currency = document.getElementById("currency").value;
  renderChart(crypto, currency);
});

// 🔹 Renderiza gráfico inicial
renderChart();
