// Seleciona o canvas onde o gráfico será renderizado
const ctx = document.getElementById("priceChart").getContext("2d");
let chart; // variável global para armazenar o gráfico atual

// 🔹 Função para buscar dados da API da CoinGecko (usando proxy AllOrigins)
async function fetchCryptoData(crypto, currency) {
  // Proxy CORS para evitar bloqueio do GitHub Pages
  const url = `https://api.allorigins.win/raw?url=https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=7&interval=hourly`;

  try {
    const response = await fetch(url);

    // Se a resposta for inválida, lança erro
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    // Se não vier o campo "prices", exibe erro no console
    if (!data.prices) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", data);
      return [];
    }

    // Mapeia os dados de preço (timestamp e valor)
    const prices = data.prices.map(p => ({
      time: new Date(p[0]),
      value: p[1]
    }));

    return prices;

  } catch (error) {
    console.error("❌ Erro ao buscar dados:", error);
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

  // Se já houver um gráfico, destrói antes de criar outro
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crypto.toUpperCase()} em ${currency.toUpperCase()}`,
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
        x: {
          ticks: { color: "#c9d1d9" }
        },
        y: {
          ticks: { color: "#c9d1d9" }
        }
      },
      plugins: {
        legend: { labels: { color: "#c9d1d9" } },
        tooltip: { mode: "index", intersect: false }
      }
    }
  });
}

// 🔹 Botão de atualização manual
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value;
  const currency = document.getElementById("currency").value;
  renderChart(crypto, currency);
});

// 🔹 Renderiza o gráfico inicial ao carregar a página
renderChart();
