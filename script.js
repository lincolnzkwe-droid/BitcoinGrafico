const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// 🔹 Função para buscar histórico de preços via CoinRanking (proxy público sem CORS)
async function fetchCryptoData(crypto, currency) {
  try {
    // Mapeamento simples de IDs compatíveis com CoinRanking
    const coinMap = {
      bitcoin: "Qwsogvtv82FCd",
      ethereum: "razxDUgYGNAdQ",
      solana: "zNZHO_Sjf",
      dogecoin: "a91GCGd_u96cF"
    };

    const coinId = coinMap[crypto] || "Qwsogvtv82FCd";
    const url = `https://api.coinranking.com/v2/coin/${coinId}/history?timePeriod=7d`;

    const response = await fetch(url);
    const json = await response.json();

    const data = json.data?.history;
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", json);
      return [];
    }

    return data.map(p => ({
      time: new Date(p.timestamp * 1000),
      value: parseFloat(p.price)
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar dados da CoinRanking:", error);
    return [];
  }
}

// 🔹 Busca taxa de câmbio (USD → BRL ou EUR)
async function getExchangeRate(toCurrency) {
  if (toCurrency === "usd") return 1;
  try {
    const url = `https://api.exchangerate.host/latest?base=USD&symbols=${toCurrency.toUpperCase()}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.rates[toCurrency.toUpperCase()] || 1;
  } catch {
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

// 🔹 Botão de atualização
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value;
  const currency = document.getElementById("currency").value;
  renderChart(crypto, currency);
});

// 🔹 Renderiza o gráfico inicial
renderChart();
