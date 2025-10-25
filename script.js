// Seleciona o canvas onde o gráfico será renderizado
const ctx = document.getElementById("priceChart").getContext("2d");
let chart; // variável global do gráfico

// 🔹 Função para buscar dados da API CoinCap
async function fetchCryptoData(crypto, currency) {
  try {
    // Define o intervalo dos últimos 7 dias
    const end = Date.now();
    const start = end - (7 * 24 * 60 * 60 * 1000); // 7 dias em milissegundos

    // CoinCap fornece dados históricos em USD
    const url = `https://api.coincap.io/v2/assets/${crypto}/history?interval=h1&start=${start}&end=${end}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ${response.status}`);

    const json = await response.json();
    const data = json.data;

    if (!data || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", json);
      return [];
    }

    const prices = data.map(p => ({
      time: new Date(p.time),
      value: parseFloat(p.priceUsd)
    }));

    return prices;

  } catch (error) {
    console.error("❌ Erro ao buscar dados CoinCap:", error);
    return [];
  }
}

// 🔹 Função para renderizar o gráfico
async function renderChart(crypto = "bitcoin", currency = "usd") {
  const data = await fetchCryptoData(crypto, currency);

  if (!data || data.length === 0) {
    console.error("⚠️ Nenhum dado disponível para renderizar o gráfico.");
    return;
  }

  const labels = data.map(d => d.time.toLocaleString());
  const values = data.map(d => d.value);

  // Destroi o gráfico antigo se existir
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crypto.toUpperCase()} (USD)`,
        data: values,
        borderColor: "#00ff99",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: "rgba(0,255,153,0.1)",
        tension: 0.3
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
  const crypto = document.getElementById("crypto").value;
  renderChart(crypto);
});

// 🔹 Renderiza o gráfico inicial ao carregar
renderChart();
