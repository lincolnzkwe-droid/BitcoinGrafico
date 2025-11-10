const ctx = document.getElementById("priceChart").getContext("2d");
let chart;
let currentRange = "1D"; // padrão inicial

// 🔧 Mapeia params por período
function getRangeParams(range) {
  const now = new Date();
  switch (range) {
    case "1D":
      // 24h com velas de 5 minutos (288 pontos)
      return { interval: "5m", limit: 288 };
    case "5D":
      // 5 dias com velas de 1 hora (120 pontos)
      return { interval: "1h", limit: 5 * 24 };
    case "1M":
      // ~30 dias com velas de 1 hora (720 pontos)
      return { interval: "1h", limit: 30 * 24 };
    case "1Y":
      // 1 ano com velas diárias
      return { interval: "1d", limit: 365 };
    case "YTD":
      // De 1º de janeiro até agora, velas diárias
      const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      return { interval: "1d", startTime: startOfYear.getTime() };
    default:
      // fallback para 7 dias (1h)
      return { interval: "1h", limit: 7 * 24 };
  }
}

// 🔹 Função: busca dados da Binance com proxy (AllOrigins)
async function fetchCryptoData(crypto, currency, range) {
  try {
    const symbol = currency === "BRL" ? `${crypto}BRL` : `${crypto}USDT`;
    const { interval, limit, startTime } = getRangeParams(range);

    // Monta endpoint de klines
    const params = new URLSearchParams({ symbol, interval });
    if (limit) params.set("limit", limit);
    if (startTime) params.set("startTime", String(startTime));

    const target = `https://api.binance.com/api/v3/klines?${params.toString()}`;
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

    const response = await fetch(url);
    const wrapped = await response.json();

    // A resposta real vem dentro de wrappe
