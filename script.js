const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const currentMMR = document.getElementById("currentMMR");
const desiredMMR = document.getElementById("desiredMMR");
const currentValue = document.getElementById("currentValue");
const desiredValue = document.getElementById("desiredValue");
const etaText = document.getElementById("etaText");
const totalPriceEl = document.getElementById("totalPrice");

const optDuo = document.getElementById("optDuo");
const optStream = document.getElementById("optStream");
const optPriority = document.getElementById("optPriority");
const optHeroes = document.getElementById("optHeroes");
const optOffline = document.getElementById("optOffline");

const promoInput = document.getElementById("promoInput");
const applyPromoBtn = document.getElementById("applyPromo");
const promoInfo = document.getElementById("promoInfo");
const checkoutBtn = document.getElementById("checkoutBtn");

let basePrice = 0;
let finalPrice = 0;
let promoDiscount = 0;

function clampDesired() {
  if (Number(desiredMMR.value) <= Number(currentMMR.value)) {
    desiredMMR.value = Number(currentMMR.value) + 100;
  }
}

function calcPrice() {
  const cur = Number(currentMMR.value);
  const des = Number(desiredMMR.value);
  const diff = Math.max(des - cur, 0);

  basePrice = diff * 0.5; // 1 MMR = 0.5 ₽

  let extra = 0;
  if (optDuo.checked) extra += basePrice * 0.25;
  if (optStream.checked) extra += basePrice * 0.15;
  if (optPriority.checked) extra += basePrice * 0.35;
  if (optHeroes.checked) extra += 50;
  if (optOffline.checked) extra += 30;

  let price = basePrice + extra;
  price = price * (1 - promoDiscount);

  finalPrice = price;
  totalPriceEl.textContent = `${finalPrice.toFixed(0)} ₽`;

  const days = Math.max(Math.ceil(diff / 500), 1);
  etaText.textContent = `~ ${days} дн${days > 1 ? "я" : "ей"}`;
}

currentMMR.addEventListener("input", () => {
  currentValue.textContent = currentMMR.value;
  clampDesired();
  desiredValue.textContent = desiredMMR.value;
  calcPrice();
});

desiredMMR.addEventListener("input", () => {
  clampDesired();
  desiredValue.textContent = desiredMMR.value;
  calcPrice();
});

[optDuo, optStream, optPriority, optHeroes, optOffline].forEach(el => {
  el.addEventListener("change", calcPrice);
});

applyPromoBtn.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  if (!code) {
    promoDiscount = 0;
    promoInfo.textContent = "";
    calcPrice();
    return;
  }

  if (code === "DOTA10") {
    promoDiscount = 0.10;
    promoInfo.textContent = "Промокод применён: скидка 10%";
  } else if (code === "DOTA20") {
    promoDiscount = 0.20;
    promoInfo.textContent = "Промокод применён: скидка 20%";
  } else {
    promoDiscount = 0;
    promoInfo.textContent = "Неверный промокод";
  }
  calcPrice();
});

// === Оформление заказа + FunPay + номер заказа ===
checkoutBtn.addEventListener("click", () => {
  // Генерация уникального номера заказа
  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  const payload = {
    тип: "заказ",
    номер: orderId,
    текущий_MMR: Number(currentMMR.value),
    желаемый_MMR: Number(desiredMMR.value),
    опции: {
      дуо: optDuo.checked,
      стрим: optStream.checked,
      приоритет: optPriority.checked,
      герои: optHeroes.checked,
      офлайн: optOffline.checked,
    },
    промокод: promoInput.value.trim(),
    цена: Number(finalPrice.toFixed(0)),
  };

  // Текст для FunPay
  const funpayText =
`🔥 Заказ № ${payload.номер}

Буст Dota 2
MMR: ${payload.текущий_MMR} → ${payload.желаемый_MMR}

Опции:
• Duo: ${payload.опции.дуо ? "Да" : "Нет"}
• Стрим: ${payload.опции.стрим ? "Да" : "Нет"}
• Приоритет: ${payload.опции.приоритет ? "Да" : "Нет"}
• Выбор героев: ${payload.опции.герои ? "Да" : "Нет"}
• Офлайн: ${payload.опции.офлайн ? "Да" : "Нет"}

Промокод: ${payload.промокод || "нет"}
💰 Цена: ${payload.цена} ₽

Отправьте этот текст продавцу на FunPay.`;

  payload.funpay_text = funpayText;

  if (tg) {
    tg.sendData(JSON.stringify(payload));
  }

  const funpayLot = "https://funpay.com/lots/offer?id=69707439"; // ← вставь ссылку на свой лот
  window.location.href = funpayLot;
});

calcPrice();
