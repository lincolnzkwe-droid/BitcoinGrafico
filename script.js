const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

async function fetchCryptoData(crypto, currency) {
  const url = `https://api.allorigins.win/raw?url=https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${currency}&days=7&interval=hourly`;
  const response = await fetch(url);
  const data = await response.json();

  const prices = data.prices.map(p => ({
    time: new Date(p[0]),
    value: p[1]
  }));

  return prices;
}

async function renderChart(crypto = "bitcoin", currency = "usd") {
  const data = await fetchCryptoData(crypto, currency);
  const labels = data.map(d => d.time.toLocaleString());
  const values = data.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: `${crypto.toUpperCase()} em ${currency.toUpperCase()}`,
        data: values,
        borderColor: "#f2a900",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: "rgba(242, 169, 0, 0.1)",
        tension: 0.2
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

document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value;
  const currency = document.getElementById("currency").value;
  renderChart(crypto, currency);
});

renderChart(); // renderiza o gráfico inicial
