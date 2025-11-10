const ctx = document.getElementById("priceChart").getContext("2d");
let chart;

// ⏱️ Estado de período + cache do último dataset bruto (para não refetchar ao trocar o período)
let currentRange = "1D";
let cachedRawData = [];
let lastKey = "";

// 🔹 Função: busca dados da Binance com proxy confiável (Codetabs)
// (NÃO ALTEREI a URL/params da API; permanece 1h/168)
async function fetchCryptoData(crypto, currency) {
  try {
    const symbol = currency === "BRL" ? `${crypto}BRL` : `${crypto}USDT`;
    const target = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=168`;

    // 🔹 Proxy Codetabs (mantido exatamente como você enviou)
    const url = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(target)}`;

    const response = await fetch(url);
    const text = await response.text(); // codetabs retorna texto puro

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("⚠️ A resposta do proxy não era JSON válido:", text);
      return [];
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.error("⚠️ Nenhum dado de preço encontrado. Resposta da API:", data);
      return [];
    }

    // Mapeia para { time, value } em 1h
    return data.map(item => ({
      time: new Date(item[0]),
      value: parseFloat(item[4]),
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar dados da Binance:", error);
    return [];
  }
}

// 🧮 Filtro por período sobre o dataset já baixado (1h candles)
// Obs.: com 168 pontos (~7 dias), 1M/1Y/YTD podem ficar sem dados suficientes.
function filterByRange(data, range) {
  const pointsPerHour = 1; // já estamos em 1h
  const perDay = 24 * pointsPerHour;

  let needed;
  if (range === "1D") needed = 1 * perDay;
  else if (range === "5D") needed = 5 * perDay;
  else if (range === "1M") needed = 30 * perDay; // ~720 pontos (provavelmente > 168)
  else if (range === "1Y") needed = 365 * perDay; // muito acima de 168
  else if (range === "YTD") {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
    const days = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
    needed = days * perDay;
  } else {
    needed = 7 * perDay; // fallback 7 dias
  }

  if (data.length < needed) {
    console.warn(
      `⚠️ Dados insuficientes para ${range} com a janela atual (temos ${data.length}, precisaríamos de ${needed}). ` +
      `A URL atual pega ~7 dias (interval=1h&limit=168).`
    );
    return data.slice(-Math.min(data.length, needed)); // mostra o que tiver
  }

  return data.slice(-needed);
}

// 🧱 cria os botões de período dinamicamente sem mexer no HTML
function ensureRangeButtons() {
  // se já existe, não recria
  if (document.querySelector(".ranges")) return;

  const canvasEl = document.getElementById("priceChart");
  const container = document.createElement("div");
  container.className = "ranges";

  const ranges = ["1D", "5D", "1M", "1Y", "YTD"];
  ranges.forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = r;
    btn.dataset.range = r;
    btn.className = "range-btn";
    // estilo mínimo inline (já que não vamos mexer no CSS do projeto agora)
    btn.style.background = "#161b22";
    btn.style.border = "1px solid #30363d";
    btn.style.color = "#c9d1d9";
    btn.style.padding = "6px 10px";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.margin = "4px";
    if (r === currentRange) {
      btn.style.borderColor = "#00ff99";
      btn.style.boxShadow = "0 0 0 2px rgba(0,255,153,0.15) inset";
      btn.style.fontWeight = "600";
    }

    btn.addEventListener("click", () => {
      // alterna “ativo”
      document.querySelectorAll(".range-btn").forEach(b => {
        b.style.borderColor = "#30363d";
        b.style.boxShadow = "none";
        b.style.fontWeight = "400";
      });
      btn.style.borderColor = "#00ff99";
      btn.style.boxShadow = "0 0 0 2px rgba(0,255,153,0.15) inset";
      btn.style.fontWeight = "600";

      currentRange = r;

      // re-render usando o cache (sem refetch)
      if (cachedRawData.length) {
        drawChart(cachedRawData);
      } else {
        // fallback: render padrão (vai refetchar)
        const crypto = document.getElementById("crypto").value.toUpperCase();
        const currency = document.getElementById("currency").value.toUpperCase();
        renderChart(crypto, currency);
      }
    });

    container.appendChild(btn);
  });

  // insere acima do canvas
  canvasEl.parentNode.insertBefore(container, canvasEl);
}

// 🖼️ desenha o gráfico com base no cache + período atual
function drawChart(raw) {
  const filtered = filterByRange(raw, currentRange);
  if (!filtered.length) {
    console.warn("⚠️ Nenhum dado disponível para renderizar o gráfico.");
    return;
  }

  const labels = filtered.map(d => d.time.toLocaleString());
  const values = filtered.map(d => d.value);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `${document.getElementById("crypto").value.toUpperCase()}/${document.getElementById("currency").value.toUpperCase()} — ${currentRange}`,
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

// 🔹 Função: desenha o gráfico (busca + cache + draw)
async function renderChart(crypto = "BTC", currency = "USD") {
  // cria botões se não existirem
  ensureRangeButtons();

  const key = `${crypto}_${currency}`;
  // se mudou cripto/moeda, refaz o fetch e atualiza cache
  if (key !== lastKey) {
    const cryptoData = await fetchCryptoData(crypto, currency);
    if (!cryptoData.length) {
      console.warn("⚠️ Nenhum dado disponível para renderizar o gráfico.");
      return;
    }
    cachedRawData = cryptoData;
    lastKey = key;
  }

  // desenha conforme o período atual
  drawChart(cachedRawData);
}

// 🔹 Botão de atualização (troca cripto/moeda)
document.getElementById("updateChart").addEventListener("click", () => {
  const crypto = document.getElementById("crypto").value.toUpperCase();
  const currency = document.getElementById("currency").value.toUpperCase();
  // ao trocar par, mantemos o período atual, mas refetch
  lastKey = ""; // força refetch
  renderChart(crypto, currency);
});

// 🔹 Carrega gráfico inicial
renderChart();
