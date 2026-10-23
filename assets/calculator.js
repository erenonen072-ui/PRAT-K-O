(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const requestedSlug = params.get("tool");

  // Araç listesini farklı yaygın değişken adlarından bul.
  const tools =
    window.HESAPGO_TOOLS ||
    window.HESAPGO_BASE ||
    window.tools ||
    window.araclar ||
    [];

  const tool = Array.isArray(tools)
    ? tools.find((item) => item.slug === requestedSlug)
    : null;

  const fieldsEl = $("fields");
  const form = $("calcForm");
  const resultEl = $("result");
  const resultText = $("resultText");
  const resultDetail = $("resultDetail");
  let lastResult = "";

  const definitions = {
    percentage: ["Sayı", "Yüzde oranı"],
    discount: ["Ürün fiyatı", "İndirim oranı (%)"],
    vat: ["KDV hariç fiyat", "KDV oranı (%)"],
    age: ["Doğum yılı"],
    "date-difference": ["Başlangıç tarihi", "Bitiş tarihi"],
    average: ["1. sayı", "2. sayı", "3. sayı", "4. sayı", "5. sayı"],
    "weighted-average": ["1. not", "1. notun ağırlığı", "2. not", "2. notun ağırlığı"],
    words: ["Metin"],
    characters: ["Metin"],
    sentences: ["Metin"],
    profit: ["Alış fiyatı", "Satış fiyatı"],
    tip: ["Hesap tutarı", "Bahşiş oranı (%)", "Kişi sayısı"],
    split: ["Toplam tutar", "Kişi sayısı"],
    fuel: ["Gidilen mesafe (km)", "100 km'de tüketim (L)", "Yakıtın litre fiyatı"],
    electricity: ["Tüketim (kWh)", "Birim fiyat"],
    addition: ["1. sayı", "2. sayı"],
    subtraction: ["1. sayı", "2. sayı"],
    multiplication: ["1. sayı", "2. sayı"],
    division: ["Bölünen sayı", "Bölen sayı"],
    ratio: ["1. değer", "2. değer"],
    "rectangle-area": ["Uzunluk", "Genişlik"],
    "rectangle-perimeter": ["Uzunluk", "Genişlik"],
    "circle-area": ["Yarıçap"],
    "circle-perimeter": ["Yarıçap"],
    "triangle-area": ["Taban", "Yükseklik"],
    hypotenuse: ["Dik kenar 1", "Dik kenar 2"],
    interest: ["Ana para", "Yıllık faiz (%)", "Süre (yıl)"],
    savings: ["Başlangıç birikimi", "Aylık ekleme", "Ay sayısı"],
    installment: ["Toplam tutar", "Taksit sayısı"],
    length: ["Değer", "Metreye dönüşüm katsayısı"],
    weight: ["Değer", "Kilograma dönüşüm katsayısı"],
    temperature: ["Sıcaklık (°C)"],
    volume: ["Değer", "Litreye dönüşüm katsayısı"],
    area: ["Değer", "Metrekareye dönüşüm katsayısı"],
    speed: ["Mesafe (km)", "Süre (saat)"],
    storage: ["Değer", "1024 tabanında dönüştürme katsayısı"],
    paint: ["Duvar alanı (m²)", "1 litre boyanın kapladığı alan (m²)"],
    tiles: ["Alan (m²)", "Bir karonun alanı (m²)"],
    concrete: ["Uzunluk (m)", "Genişlik (m)", "Yükseklik (m)"],
    salary: ["Brüt tutar", "Kesinti oranı (%)"],
    time: ["Saat", "Dakika"]
  };

  const textTypes = new Set(["words", "characters", "sentences"]);
  const dateTypes = new Set(["date-difference"]);

  function makeField(label, index, type) {
    const wrapper = document.createElement("div");
    wrapper.className = "field";

    const id = `input-${index}`;
    const labelEl = document.createElement("label");
    labelEl.htmlFor = id;
    labelEl.textContent = label;

    const input = document.createElement(
      textTypes.has(type) ? "textarea" : "input"
    );

    input.id = id;
    input.name = id;
    input.required = true;

    if (textTypes.has(type)) {
      input.rows = 3;
      input.placeholder = "Metnini buraya yaz...";
      input.style.resize = "vertical";
    } else if (dateTypes.has(type)) {
      input.type = "date";
    } else {
      input.type = "number";
      input.step = "any";
      input.inputMode = "decimal";
      input.placeholder = "Değer gir";
    }

    wrapper.append(labelEl, input);
    fieldsEl.appendChild(wrapper);
  }

  function number(index) {
    const el = $(`input-${index}`);
    const value = Number(el.value);

    if (!el || el.value.trim() === "" || !Number.isFinite(value)) {
      throw new Error("Lütfen tüm sayısal alanları doğru doldur.");
    }

    return value;
  }

  function textValue(index) {
    return $(`input-${index}`).value.trim();
  }

  function dateValue(index) {
    const value = $(`input-${index}`).value;
    if (!value) throw new Error("Lütfen tarih alanlarını doldur.");
    return new Date(`${value}T00:00:00Z`);
  }

  function fmt(value) {
    if (!Number.isFinite(value)) {
      throw new Error("Bu değerlerle sonuç hesaplanamıyor.");
    }

    return new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 4
    }).format(value);
  }

  function calculate(type) {
    switch (type) {
      case "percentage":
        return fmt(number(0) * number(1) / 100);

      case "discount": {
        const price = number(0);
        const rate = number(1);
        return `İndirimli fiyat: ${fmt(price * (1 - rate / 100))} TL`;
      }

      case "vat": {
        const price = number(0);
        const rate = number(1);
        return `KDV dahil: ${fmt(price * (1 + rate / 100))} TL`;
      }

      case "age": {
        const year = number(0);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          throw new Error("Geçerli bir doğum yılı gir.");
        }
        return `${currentYear - year} yaş (yaklaşık)`;
      }

      case "date-difference": {
        const diff = Math.abs(dateValue(1) - dateValue(0));
        return `${Math.floor(diff / 86400000)} gün`;
      }

      case "average": {
        const values = [0, 1, 2, 3, 4]
          .map((i) => $(`input-${i}`).value.trim())
          .filter(Boolean)
          .map(Number);

        if (!values.length || values.some((v) => !Number.isFinite(v))) {
          throw new Error("En az bir geçerli sayı gir.");
        }
        return fmt(values.reduce((a, b) => a + b, 0) / values.length);
      }

      case "weighted-average": {
        const n1 = number(0), w1 = number(1);
        const n2 = number(2), w2 = number(3);
        if (w1 + w2 === 0) throw new Error("Ağırlıkların toplamı sıfır olamaz.");
        return fmt((n1 * w1 + n2 * w2) / (w1 + w2));
      }

      case "words":
        return `${textValue(0).split(/\s+/).filter(Boolean).length} kelime`;

      case "characters":
        return `${textValue(0).length} karakter`;

      case "sentences": {
        const value = textValue(0);
        const matches = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
        return `${matches ? matches.filter((s) => s.trim()).length : 0} cümle`;
      }

      case "profit": {
        const diff = number(1) - number(0);
        return `${fmt(diff)} TL ${diff >= 0 ? "kâr" : "zarar"}`;
      }

      case "tip":
        return `Toplam: ${fmt(number(0) * (1 + number(1) / 100))} TL • Kişi başı: ${fmt(number(0) * (1 + number(1) / 100) / Math.max(1, number(2)))} TL`;

      case "split": {
        const count = number(1);
        if (count <= 0) throw new Error("Kişi sayısı sıfırdan büyük olmalı.");
        return `Kişi başı ${fmt(number(0) / count)} TL`;
      }

      case "fuel": {
        const km = number(0), consumption = number(1), price = number(2);
        return `Tüketim: ${fmt(km * consumption / 100)} L • Maliyet: ${fmt(km * consumption / 100 * price)} TL`;
      }

      case "electricity":
        return `${fmt(number(0) * number(1))} TL (girilen birim fiyata göre)`;

      case "addition":
        return fmt(number(0) + number(1));

      case "subtraction":
        return fmt(number(0) - number(1));

      case "multiplication":
        return fmt(number(0) * number(1));

      case "division":
        if (number(1) === 0) throw new Error("Bir sayı sıfıra bölünemez.");
        return fmt(number(0) / number(1));

      case "ratio":
        if (number(1) === 0) throw new Error("İkinci değer sıfır olamaz.");
        return fmt(number(0) / number(1));

      case "rectangle-area":
        return `${fmt(number(0) * number(1))} birim²`;

      case "rectangle-perimeter":
        return `${fmt(2 * (number(0) + number(1)))} birim`;

      case "circle-area":
        if (number(0) < 0) throw new Error("Yarıçap negatif olamaz.");
        return `${fmt(Math.PI * number(0) ** 2)} birim²`;

      case "circle-perimeter":
        if (number(0) < 0) throw new Error("Yarıçap negatif olamaz.");
        return `${fmt(2 * Math.PI * number(0))} birim`;

      case "triangle-area":
        return `${fmt(number(0) * number(1) / 2)} birim²`;

      case "hypotenuse":
        return `${fmt(Math.hypot(number(0), number(1)))} birim`;

      case "interest":
        return `${fmt(number(0) * number(1) / 100 * number(2))} TL basit faiz`;

      case "savings":
        return `${fmt(number(0) + number(1) * number(2))} TL (getiri hariç)`;

      case "installment": {
        const count = number(1);
        if (count <= 0) throw new Error("Taksit sayısı sıfırdan büyük olmalı.");
        return `Aylık ${fmt(number(0) / count)} TL (faiz hariç)`;
      }

      case "length":
      case "weight":
      case "volume":
      case "area":
      case "storage":
        return fmt(number(0) * number(1));

      case "temperature":
        return `${fmt(number(0))} °C • ${fmt(number(0) * 9 / 5 + 32)} °F`;

      case "speed": {
        const time = number(1);
        if (time <= 0) throw new Error("Süre sıfırdan büyük olmalı.");
        return `${fmt(number(0) / time)} km/saat`;
      }

      case "paint": {
        const coverage = number(1);
        if (coverage <= 0) throw new Error("Kaplama alanı sıfırdan büyük olmalı.");
        return `${fmt(number(0) / coverage)} litre (tek kat için yaklaşık)`;
      }

      case "tiles": {
        const tileArea = number(1);
        if (tileArea <= 0) throw new Error("Karo alanı sıfırdan büyük olmalı.");
        return `${Math.ceil(number(0) / tileArea)} adet (fire hariç)`;
      }

      case "concrete":
        return `${fmt(number(0) * number(1) * number(2))} m³`;

      case "salary":
        return `${fmt(number(0) * (1 - number(1) / 100))} (girilen kesinti oranına göre)`;

      case "time":
        return `${fmt(number(0) * 60 + number(1))} dakika`;

      default:
        throw new Error("Bu araç türü henüz hesaplama motoruna eklenmedi.");
    }
  }

  function renderRelated() {
    const related = $("related");
    if (!Array.isArray(tools) || !tool) return;

    const matches = tools
      .filter((item) => item.slug !== tool.slug && item.category === tool.category)
      .slice(0, 6);

    related.replaceChildren();

    matches.forEach((item) => {
      const link = document.createElement("a");
      link.className = "related-card";
      link.href = `/arac.html?tool=${encodeURIComponent(item.slug)}`;

      const title = document.createElement("strong");
      title.textContent = item.name;

      const description = document.createElement("span");
      description.textContent = item.description || "Pratik online hesaplama aracı.";

      link.append(title, description);
      related.appendChild(link);
    });
  }

  if (!tool) {
    $("title").textContent = "Hesaplama Araçları";
    $("desc").textContent = "Kullanmak istediğin aracı seçerek hesaplamaya başlayabilirsin.";
    $("formTitle").textContent = "Araç bulunamadı";
    fieldsEl.innerHTML = "";
    resultText.textContent = "Bağlantıdaki araç bulunamadı. Ana sayfadan bir araç seç.";
    form.querySelector('button[type="submit"]').disabled = true;
  } else {
    const name = tool.name || "Hesaplama Aracı";
    const type = tool.type || "";
    const labels = definitions[type];

    document.title = `${name} | HESAPGO`;
    $("title").textContent = name;
    $("crumb").textContent = name;
    $("formTitle").textContent = `${name} hesaplama`;
    $("desc").textContent = tool.description || `${name} aracını kullanarak sonucunu kolayca hesapla.`;
    $("howTo").textContent = `${name} için gerekli değerleri gir, Hesapla düğmesine bas ve sonucu sonuç panelinde görüntüle.`;

    if (labels) {
      labels.forEach((label, index) => makeField(label, index, type));
    } else {
      fieldsEl.innerHTML = '<p>Bu araç için henüz giriş alanları tanımlanmamış.</p>';
      form.querySelector('button[type="submit"]').disabled = true;
    }

    renderRelated();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!tool) return;

    try {
      const answer = calculate(tool.type);
      lastResult = String(answer);
      resultEl.textContent = lastResult;
      resultText.textContent = "Hesaplama tamamlandı.";
      resultDetail.textContent = "Girdiğin değerlere göre hesaplanan sonuç aşağıdadır.";
    } catch (error) {
      lastResult = "";
      resultEl.textContent = "Kontrol et";
      resultText.textContent = error.message || "Hesaplama yapılamadı.";
      resultDetail.textContent = "Alanları kontrol edip tekrar dene.";
    }
  });

  form.addEventListener("reset", () => {
    lastResult = "";
    resultEl.textContent = "—";
    resultText.textContent = "Hesaplama yapmak için alanları doldur.";
    resultDetail.textContent = "Sonucun burada gösterilecek.";
  });

  $("copyResult").addEventListener("click", async () => {
    if (!lastResult) {
      resultText.textContent = "Önce bir hesaplama yapmalısın.";
      return;
    }

    try {
      await navigator.clipboard.writeText(lastResult);
      resultText.textContent = "Sonuç kopyalandı.";
    } catch {
      resultText.textContent = `Kopyalama desteklenmedi. Sonuç: ${lastResult}`;
    }
  });
})();
