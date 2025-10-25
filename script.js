const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Busca histórico de preços da API CoinPaprika
async function fetchCryptoData(crypto, currency) {
  try {
    // Mapeamento dos IDs da CoinPaprika
    const coinMap = {
      bitcoin: "btc-bitcoin",
      ethereum: "eth-ethereum",
      solana: "sol-solana",
      dogecoin: "doge-dogecoin"
    };

    const coinId = coinMap[crypto] || "btc-bitcoin";

    // CoinPaprika retorna dados em USD
    const url = `https://api.coinpaprika.com/v1/tickers/${coinId}/historical?start=${getDate(7)}&interval=1h`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ${response.status}`);

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", data);
      return [];
    }

    return data.map(p => ({
      time: new Date(p.timestamp),
      value: parseFloat(p.price)
    }));

  } catch (error) {
    console.error("❌ Erro ao buscar dados CoinPaprika:", error);
    return [];
  }
}

// 🔹 Função auxiliar: retorna data formatada YYYY-MM-DD
function getDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

// 🔹 Busca taxa de câmbio (para converter USD → BRL ou EUR)
async function getExchangeRate(toCurrency) {
  if (toCurrency === "usd") return 1;

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
  const cryptoData = await fetchCryptoData(crypto, currency);
  if (!cryptoData.length) return console.error("⚠️ Nenhum dado disponível para renderizar o gráfico.");

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

// 🔹 Botão "Atualizar"
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value;
  const currency = document.getElementById("currency").value;
  renderChart(crypto, currency);
});

// 🔹 Renderização inicial
renderChart();
