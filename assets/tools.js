
const HESAPGO_BASE = [
["Yüzde Hesaplama","Matematik","percentage"],
["Yüzde Artış Hesaplama","Matematik","percentage"],
["Yüzde Azalış Hesaplama","Matematik","percentage"],
["Yüzde Farkı","Matematik","percentage"],
["İndirim Hesaplama","Finans","discount"],
["İndirimli Fiyat","Finans","discount"],
["İndirim Tutarı","Finans","discount"],
["KDV Hesaplama","Finans","vat"],
["KDV Dahil Fiyat","Finans","vat"],
["KDV Hariç Fiyat","Finans","vat"],
["Yaş Hesaplama","Tarih ve Zaman","age"],
["İki Tarih Arası Gün","Tarih ve Zaman","date-difference"],
["Not Ortalaması","Eğitim","average"],
["Sınav Ortalaması","Eğitim","average"],
["Ağırlıklı Ortalama","Eğitim","weighted-average"],
["Kelime Sayacı","Metin Araçları","words"],
["Karakter Sayacı","Metin Araçları","characters"],
["Cümle Sayacı","Metin Araçları","sentences"],
["Kâr Hesaplama","İş ve Alışveriş","profit"],
["Kâr Marjı","İş ve Alışveriş","profit"],
["Bahşiş Hesaplama","Günlük Yaşam","tip"],
["Masraf Paylaşımı","Günlük Yaşam","split"],
["Yakıt Maliyeti","Günlük Yaşam","fuel"],
["Elektrik Maliyeti","Günlük Yaşam","electricity"],
["Ortalama Hesaplama","Matematik","average"],
["Toplama","Matematik","addition"],
["Çıkarma","Matematik","subtraction"],
["Çarpma","Matematik","multiplication"],
["Bölme","Matematik","division"],
["Oran Hesaplama","Matematik","ratio"],
["Dikdörtgen Alanı","Geometri","rectangle-area"],
["Dikdörtgen Çevresi","Geometri","rectangle-perimeter"],
["Daire Alanı","Geometri","circle-area"],
["Çember Çevresi","Geometri","circle-perimeter"],
["Üçgen Alanı","Geometri","triangle-area"],
["Hipotenüs Hesaplama","Geometri","hypotenuse"],
["Basit Faiz","Finans","interest"],
["Birikim Hesaplama","Finans","savings"],
["Taksit Hesaplama","Finans","installment"],
["Birim Dönüştürücü","Birim Dönüştürücü","length"],
["Kilometre Metre","Birim Dönüştürücü","length"],
["Santimetre Metre","Birim Dönüştürücü","length"],
["Kilogram Gram","Birim Dönüştürücü","weight"],
["Santigrat Fahrenheit","Birim Dönüştürücü","temperature"],
["Litre Mililitre","Birim Dönüştürücü","volume"],
["Metrekare Dönüştürücü","Birim Dönüştürücü","area"],
["Hız Dönüştürücü","Birim Dönüştürücü","speed"],
["Veri Boyutu Dönüştürücü","Teknoloji","storage"],
["Boya Miktarı","İnşaat","paint"],
["Fayans Sayısı","İnşaat","tiles"],
["Beton Hacmi","İnşaat","concrete"],
["Saatlik Ücret","İş ve Üretkenlik","salary"],
["Çalışma Süresi","İş ve Üretkenlik","time"]
];

const HESAPGO_SUFFIXES = [
  "Hesaplama",
  "Hesabı",
  "Bulucu",
  "Aracı",
  "Asistanı",
  "Pratik",
  "Hızlı",
  "Online"
];

function hesapgoSlug(text) {
  const map = {
    "ı":"i","ğ":"g","ü":"u","ş":"s",
    "ö":"o","ç":"c","İ":"i","Ğ":"g",
    "Ü":"u","Ş":"s","Ö":"o","Ç":"c"
  };

  return text
    .split("")
    .map(ch => map[ch] || ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hesapgoDescription(name) {
  return `${name} işlemini kolayca yapın. Değerleri girin ve hesaplama sonucunu görüntüleyin.`;
}

const HESAPGO_TOOLS = [];
const usedSlugs = new Set();

function addTool(name, category, type) {
  let slug = hesapgoSlug(name);
  if (usedSlugs.has(slug)) return;

  usedSlugs.add(slug);

  HESAPGO_TOOLS.push({
    name,
    category,
    slug,
    description: hesapgoDescription(name),
    type
  });
}

HESAPGO_BASE.forEach(([name, category, type]) => {
  addTool(name, category, type);
});

const categories = [...new Set(HESAPGO_BASE.map(x => x[1]))];

let index = 0;

while (HESAPGO_TOOLS.length < 320) {
  const [baseName, category, type] =
    HESAPGO_BASE[index % HESAPGO_BASE.length];

  const suffix =
    HESAPGO_SUFFIXES[
      Math.floor(index / HESAPGO_BASE.length) %
      HESAPGO_SUFFIXES.length
    ];

  addTool(`${baseName} ${suffix}`, category, type);
  index++;

  // Sonsuz döngüye karşı güvenlik.
  if (index > 10000) break;
}

window.HESAPGO_TOOLS = HESAPGO_TOOLS;

console.info(
  `HESAPGO: ${HESAPGO_TOOLS.length} araç yüklendi.`
);
