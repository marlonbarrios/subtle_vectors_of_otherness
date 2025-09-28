import './style.css';
import OpenAI from 'openai';



const openAIKey = import.meta.env.VITE_OPENAI_KEY;

let openai;
let isLoading = true; // Start with loader visible
let sampleSound; // Declare the variable for the sound
let isSoundPlaying = false; // Track the playing state





let textToShow = "";

// Animation speed control
let animationSpeed = 0.3; // Very slow animation for landing page
let targetSpeed = 0.3; // Target speed for landing page
let speedTransition = 0.05; // Smooth speed transitions

// Language selection system
let selectedLanguage = "English";
let showLanguageMenu = false;
let languageMenuButton = null;
let languageScrollOffset = 0; // For scrolling through languages

// Available languages that GPT-4 can effectively handle
const availableLanguages = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", 
  "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hebrew",
  "Dutch", "Swedish", "Norwegian", "Danish", "Finnish", "Polish",
  "Czech", "Hungarian", "Romanian", "Greek", "Turkish", "Hindi",
  "Bengali", "Urdu", "Persian", "Thai", "Vietnamese", "Indonesian",
  "Swahili", "Yoruba", "Igbo", "Hausa", "Amharic", "Zulu", "Afrikaans",
  "Tamil", "Telugu", "Marathi", "Gujarati", "Punjabi", "Malayalam", "Kannada",
  "Ukrainian", "Bulgarian", "Serbian", "Croatian", "Bosnian", "Slovenian", "Slovak",
  "Lithuanian", "Latvian", "Estonian", "Albanian", "Macedonian", "Mongolian",
  "Kazakh", "Uzbek", "Tajik", "Kyrgyz", "Armenian", "Georgian", "Azerbaijani",
  "Malay", "Filipino", "Burmese", "Khmer", "Lao", "Nepali", "Sinhala",
  "Icelandic", "Irish", "Welsh", "Scottish Gaelic", "Basque", "Catalan", "Galician",
  "Esperanto", "Latin", "Sanskrit", "Pashto", "Dari", "Kurdish", "Tibetan"
];

// Language information: speakers and regions
const languageInfo = {
  "English": { speakers: "1.5 billion", region: "Global • UK, US, Canada, Australia" },
  "Spanish": { speakers: "500 million", region: "Spain, Latin America • 21 countries" },
  "French": { speakers: "280 million", region: "France, Canada, West/Central Africa" },
  "German": { speakers: "100 million", region: "Germany, Austria, Switzerland" },
  "Italian": { speakers: "65 million", region: "Italy, San Marino, Vatican, Switzerland" },
  "Portuguese": { speakers: "260 million", region: "Brazil, Portugal, Angola, Mozambique" },
  "Russian": { speakers: "150 million", region: "Russia, Eastern Europe, Central Asia" },
  "Chinese": { speakers: "1.1 billion", region: "China, Taiwan, Singapore" },
  "Japanese": { speakers: "125 million", region: "Japan" },
  "Korean": { speakers: "77 million", region: "South Korea, North Korea" },
  "Arabic": { speakers: "400 million", region: "Middle East, North Africa • 22 countries" },
  "Hebrew": { speakers: "9 million", region: "Israel, Jewish communities worldwide" },
  "Dutch": { speakers: "23 million", region: "Netherlands, Belgium (Flanders)" },
  "Swedish": { speakers: "10 million", region: "Sweden, Finland" },
  "Norwegian": { speakers: "5 million", region: "Norway" },
  "Danish": { speakers: "6 million", region: "Denmark, Greenland" },
  "Finnish": { speakers: "5.4 million", region: "Finland, Estonia" },
  "Polish": { speakers: "45 million", region: "Poland, diaspora communities" },
  "Czech": { speakers: "10 million", region: "Czech Republic" },
  "Hungarian": { speakers: "13 million", region: "Hungary, Romania, Slovakia" },
  "Romanian": { speakers: "24 million", region: "Romania, Moldova" },
  "Greek": { speakers: "13 million", region: "Greece, Cyprus" },
  "Turkish": { speakers: "80 million", region: "Turkey, Northern Cyprus" },
  "Hindi": { speakers: "600 million", region: "India • Hindi Belt states" },
  "Bengali": { speakers: "300 million", region: "Bangladesh, West Bengal (India)" },
  "Urdu": { speakers: "70 million", region: "Pakistan, Northern India" },
  "Persian": { speakers: "70 million", region: "Iran, Afghanistan, Tajikistan" },
  "Thai": { speakers: "60 million", region: "Thailand" },
  "Vietnamese": { speakers: "95 million", region: "Vietnam, diaspora communities" },
  "Indonesian": { speakers: "230 million", region: "Indonesia" },
  "Swahili": { speakers: "200 million", region: "East Africa • Kenya, Tanzania, Uganda" },
  "Yoruba": { speakers: "45 million", region: "Nigeria, Benin, Togo" },
  "Igbo": { speakers: "27 million", region: "Southeastern Nigeria" },
  "Hausa": { speakers: "70 million", region: "Northern Nigeria, Niger, Chad" },
  "Amharic": { speakers: "32 million", region: "Ethiopia" },
  "Zulu": { speakers: "12 million", region: "South Africa" },
  "Afrikaans": { speakers: "7 million", region: "South Africa, Namibia" },
  "Tamil": { speakers: "75 million", region: "Tamil Nadu (India), Sri Lanka, Singapore" },
  "Telugu": { speakers: "95 million", region: "Andhra Pradesh, Telangana (India)" },
  "Marathi": { speakers: "83 million", region: "Maharashtra (India)" },
  "Gujarati": { speakers: "56 million", region: "Gujarat (India), diaspora" },
  "Punjabi": { speakers: "125 million", region: "Punjab (India/Pakistan)" },
  "Malayalam": { speakers: "38 million", region: "Kerala (India)" },
  "Kannada": { speakers: "44 million", region: "Karnataka (India)" },
  "Ukrainian": { speakers: "40 million", region: "Ukraine, diaspora communities" },
  "Bulgarian": { speakers: "8 million", region: "Bulgaria" },
  "Serbian": { speakers: "12 million", region: "Serbia, Bosnia, Montenegro" },
  "Croatian": { speakers: "5.5 million", region: "Croatia, Bosnia and Herzegovina" },
  "Bosnian": { speakers: "2.5 million", region: "Bosnia and Herzegovina" },
  "Slovenian": { speakers: "2.5 million", region: "Slovenia" },
  "Slovak": { speakers: "5.2 million", region: "Slovakia" },
  "Lithuanian": { speakers: "3 million", region: "Lithuania" },
  "Latvian": { speakers: "1.9 million", region: "Latvia" },
  "Estonian": { speakers: "1.1 million", region: "Estonia" },
  "Albanian": { speakers: "8 million", region: "Albania, Kosovo, North Macedonia" },
  "Macedonian": { speakers: "2 million", region: "North Macedonia" },
  "Mongolian": { speakers: "5.7 million", region: "Mongolia, Inner Mongolia (China)" },
  "Kazakh": { speakers: "13 million", region: "Kazakhstan, Western China" },
  "Uzbek": { speakers: "34 million", region: "Uzbekistan, Afghanistan" },
  "Tajik": { speakers: "8.5 million", region: "Tajikistan, Afghanistan" },
  "Kyrgyz": { speakers: "4.5 million", region: "Kyrgyzstan" },
  "Armenian": { speakers: "7 million", region: "Armenia, diaspora worldwide" },
  "Georgian": { speakers: "4 million", region: "Georgia" },
  "Azerbaijani": { speakers: "23 million", region: "Azerbaijan, Northwestern Iran" },
  "Malay": { speakers: "290 million", region: "Malaysia, Brunei, Southern Thailand" },
  "Filipino": { speakers: "28 million", region: "Philippines" },
  "Burmese": { speakers: "33 million", region: "Myanmar" },
  "Khmer": { speakers: "16 million", region: "Cambodia" },
  "Lao": { speakers: "7 million", region: "Laos, Northeastern Thailand" },
  "Nepali": { speakers: "16 million", region: "Nepal, Northeastern India" },
  "Sinhala": { speakers: "17 million", region: "Sri Lanka" },
  "Icelandic": { speakers: "350,000", region: "Iceland" },
  "Irish": { speakers: "1.7 million", region: "Ireland, Northern Ireland" },
  "Welsh": { speakers: "880,000", region: "Wales (UK)" },
  "Scottish Gaelic": { speakers: "57,000", region: "Scotland (Highlands & Islands)" },
  "Basque": { speakers: "1.2 million", region: "Basque Country (Spain/France)" },
  "Catalan": { speakers: "10 million", region: "Catalonia, Valencia, Balearic Islands" },
  "Galician": { speakers: "2.4 million", region: "Galicia (Northwestern Spain)" },
  "Esperanto": { speakers: "2 million", region: "International auxiliary language" },
  "Latin": { speakers: "—", region: "Historical • Roman Empire, Academia" },
  "Sanskrit": { speakers: "25,000", region: "India • Ancient liturgical language" },
  "Pashto": { speakers: "60 million", region: "Afghanistan, Pakistan" },
  "Dari": { speakers: "25 million", region: "Afghanistan, Iran" },
  "Kurdish": { speakers: "30 million", region: "Kurdistan (Turkey, Iraq, Iran, Syria)" },
  "Tibetan": { speakers: "1.2 million", region: "Tibet, Bhutan, Nepal, India" }
};

// Interface translations
const translations = {
  "English": {
    title: "Subtle Vectors of Otherness",
    author: "by Marlon Barrios Solano",
    instruction: "Press SPACEBAR to generate vectors"
  },
  "Spanish": {
    title: "Vectores Sutiles de Otredad",
    author: "por Marlon Barrios Solano",
    instruction: "Presiona BARRA ESPACIADORA para generar vectores"
  },
  "French": {
    title: "Vecteurs Subtils d'Altérité",
    author: "par Marlon Barrios Solano",
    instruction: "Appuyez sur ESPACE pour générer des vecteurs"
  },
  "German": {
    title: "Subtile Vektoren der Andersheit",
    author: "von Marlon Barrios Solano",
    instruction: "Drücken Sie LEERTASTE um Vektoren zu generieren"
  },
  "Italian": {
    title: "Vettori Sottili di Alterità",
    author: "di Marlon Barrios Solano",
    instruction: "Premere BARRA SPAZIATRICE per generare vettori"
  },
  "Portuguese": {
    title: "Vetores Sutis de Alteridade",
    author: "por Marlon Barrios Solano",
    instruction: "Pressione BARRA DE ESPAÇO para gerar vetores"
  },
  "Russian": {
    title: "Тонкие Векторы Инаковости",
    author: "Марлон Барриос Солано",
    instruction: "Нажмите ПРОБЕЛ для генерации векторов"
  },
  "Chinese": {
    title: "他者性的微妙向量",
    author: "马龙·巴里奥斯·索拉诺",
    instruction: "按空格键生成向量"
  },
  "Japanese": {
    title: "他者性の微細なベクトル",
    author: "マルロン・バリオス・ソラーノ",
    instruction: "スペースキーを押してベクトルを生成"
  },
  "Korean": {
    title: "타자성의 미묘한 벡터",
    author: "말론 바리오스 솔라노",
    instruction: "스페이스바를 눌러 벡터 생성"
  },
  "Arabic": {
    title: "متجهات خفية للآخرية",
    author: "مارلون باريوس سولانو",
    instruction: "اضغط مفتاح المسافة لإنتاج المتجهات"
  },
  "Hebrew": {
    title: "וקטורים עדינים של זרות",
    author: "מרלון בריוס סולנו",
    instruction: "לחץ רווח כדי ליצור וקטורים"
  },
  "Dutch": {
    title: "Subtiele Vectoren van Anderheid",
    author: "door Marlon Barrios Solano",
    instruction: "Druk op SPATIEBALK om vectoren te genereren"
  },
  "Hindi": {
    title: "अन्यता के सूक्ष्म सदिश",
    instruction: "वैक्टर उत्पन्न करने के लिए स्पेसबार दबाएं"
  },
  "Bengali": {
    title: "অন্যত্বের সূক্ষ্ম ভেক্টর",
    instruction: "ভেক্টর উৎপাদনের জন্য স্পেসবার চাপুন"
  },
  "Swahili": {
    title: "Mielekeo Finyu ya Utofauti",
    instruction: "Bonyeza SPACEBAR ili kuzalisha mielekeo"
  },
  "Tamil": {
    title: "பிறத்தன்மையின் நுட்பமான திசையன்கள்",
    instruction: "வெக்டர்களை உருவாக்க SPACEBAR அழுத்தவும்"
  },
  "Ukrainian": {
    title: "Тонкі Вектори Інакшості",
    instruction: "Натисніть ПРОБІЛ для генерації векторів"
  },
  "Polish": {
    title: "Subtelne Wektory Inności",
    instruction: "Naciśnij SPACJĘ aby wygenerować wektory"
  },
  "Turkish": {
    title: "Ötekilik'in İnce Vektörleri",
    instruction: "Vektör oluşturmak için BOŞLUK tuşuna basın"
  },
  "Thai": {
    title: "เวกเตอร์ที่ละเอียดอ่อนของความเป็นอื่น",
    instruction: "กด SPACEBAR เพื่อสร้างเวกเตอร์"
  },
  "Vietnamese": {
    title: "Những Vector Tinh Tế của Sự Khác Biệt",
    instruction: "Nhấn SPACEBAR để tạo vector"
  },
  "Greek": {
    title: "Λεπτομερή Διανύσματα Ετερότητας",
    instruction: "Πατήστε SPACEBAR για να δημιουργήσετε διανύσματα"
  },
  "Persian": {
    title: "بردارهای ظریف دیگری",
    instruction: "برای تولید بردار SPACEBAR را فشار دهید"
  },
  "Urdu": {
    title: "دوسرے پن کے باریک ویکٹرز",
    instruction: "ویکٹر بنانے کے لیے SPACEBAR دبائیں"
  },
  "Finnish": {
    title: "Erilaisuuden Hienovaraiset Vektorit",
    instruction: "Paina VÄLILYÖNTI luodaksesi vektoreita"
  },
  "Czech": {
    title: "Jemné Vektory Jinakosti",
    instruction: "Stiskněte MEZERNÍK pro generování vektorů"
  },
  "Hungarian": {
    title: "A Másság Finom Vektorai",
    instruction: "Nyomja meg a SZÓKÖZ gombot vektorok létrehozásához"
  },
  "Romanian": {
    title: "Vectori Subtili ai Alterității",
    instruction: "Apăsați SPAȚIU pentru a genera vectori"
  },
  "Norwegian": {
    title: "Subtile Vektorer av Annerledeshet",
    instruction: "Trykk MELLOMROM for å generere vektorer"
  },
  "Swedish": {
    title: "Subtila Vektorer av Annorlundahet",
    instruction: "Tryck MELLANSLAG för att generera vektorer"
  },
  "Danish": {
    title: "Subtile Vektorer af Anderledeshed",
    instruction: "Tryk MELLEMRUM for at generere vektorer"
  },
  "Irish": {
    title: "Veicteoirí Caolchúiseacha na hEachtraíochta",
    instruction: "Brúigh SPÁS chun veicteoirí a ghiniúint"
  },
  "Welsh": {
    title: "Fectorau Cynnil Gwahaniaeth",
    instruction: "Gwasgwch GOFOD i gynhyrchu fectorau"
  },
  "Basque": {
    title: "Bestearen Bektore Fineak",
    instruction: "Sakatu ZURIUNEA bektoreak sortzeko"
  },
  "Catalan": {
    title: "Vectors Subtils d'Alteritat",
    instruction: "Premeu ESPAI per generar vectors"
  },
  "Galician": {
    title: "Vectores Sutís da Alteridade",
    instruction: "Preme ESPAZO para xerar vectores"
  },
  "Swahili": {
    title: "Mielekeo Finyu ya Utofauti",
    instruction: "Bonyeza SPACEBAR ili kuzalisha mielekeo"
  },
  "Yoruba": {
    title: "Awọn Fẹkito Tinrin ti Miiran",
    instruction: "Tẹ SPACEBAR lati ṣe awọn fẹkito"
  },
  "Igbo": {
    title: "Vector Nke Ọzọ",
    instruction: "Pịa SPACEBAR iji mepụta vector"
  },
  "Hausa": {
    title: "Vectors Masu Dauke da Bambanci",
    instruction: "Danna SPACEBAR don samar da vectors"
  },
  "Amharic": {
    title: "የሌላነት ስውር ቬክተሮች",
    instruction: "ቬክተሮችን ለመፍጠር SPACEBAR ተጫን"
  },
  "Zulu": {
    title: "Ama-vector Afihliwe Obuye",
    instruction: "Cindezela i-SPACEBAR ukuze udale ama-vector"
  },
  "Afrikaans": {
    title: "Subtiele Vektore van Andersheid",
    instruction: "Druk SPASIE om vektore te genereer"
  },
  "Telugu": {
    title: "అన్యత్వపు సూక్ష్మ వెక్టర్లు",
    instruction: "వెక్టర్లను రూపొందించడానికి SPACEBAR నొక్కండి"
  },
  "Marathi": {
    title: "परत्वाचे सूक्ष्म सदिश",
    instruction: "व्हेक्टर तयार करण्यासाठी SPACEBAR दाबा"
  },
  "Gujarati": {
    title: "અન્યત્વના સૂક્ષ્મ વેક્ટર્સ",
    instruction: "વેક્ટર બનાવવા માટે SPACEBAR દબાવો"
  },
  "Punjabi": {
    title: "ਦੂਸਰੇਪਣ ਦੇ ਸੂਖਮ ਵੈਕਟਰ",
    instruction: "ਵੈਕਟਰ ਬਣਾਉਣ ਲਈ SPACEBAR ਦਬਾਓ"
  },
  "Malayalam": {
    title: "അന്യത്വത്തിന്റെ സൂക്ഷ്മ വെക്ടറുകൾ",
    instruction: "വെക്ടറുകൾ സൃഷ്ടിക്കാൻ SPACEBAR അമർത്തുക"
  },
  "Kannada": {
    title: "ಅನ್ಯತ್ವದ ಸೂಕ್ಷ್ಮ ವೆಕ್ಟರ್‌ಗಳು",
    instruction: "ವೆಕ್ಟರ್‌ಗಳನ್ನು ರಚಿಸಲು SPACEBAR ಒತ್ತಿರಿ"
  },
  "Bulgarian": {
    title: "Фини Вектори на Инакостта",
    instruction: "Натиснете SPACEBAR за генериране на вектори"
  },
  "Serbian": {
    title: "Сuptilni Вектори Другости",
    instruction: "Притисните SPACEBAR да генеришете векторе"
  },
  "Croatian": {
    title: "Suptilni Vektori Drugosti",
    instruction: "Pritisnite SPACEBAR za generiranje vektora"
  },
  "Bosnian": {
    title: "Suptilni Vektori Drugosti",
    instruction: "Pritisnite SPACEBAR za generiranje vektora"
  },
  "Slovenian": {
    title: "Subtilni Vektorji Drugačnosti",
    instruction: "Pritisnite SPACEBAR za generiranje vektorjev"
  },
  "Slovak": {
    title: "Jemné Vektory Inakosti",
    instruction: "Stlačte MEDZERNÍK pre generovanie vektorov"
  },
  "Lithuanian": {
    title: "Kitoniškumo Subtilūs Vektoriai",
    instruction: "Spauskite TARPĄ vektorių generavimui"
  },
  "Latvian": {
    title: "Citādības Smalkie Vektori",
    instruction: "Nospiediet ATSTARPI vektoru ģenerēšanai"
  },
  "Estonian": {
    title: "Teistsugususe Peened Vektorid",
    instruction: "Vajutage TÜHIKUT vektorite genereerimiseks"
  },
  "Albanian": {
    title: "Vektorët e Hollë të Tjetërsisë",
    instruction: "Shtypni HAPËSIRË për të gjeneruar vektorë"
  },
  "Macedonian": {
    title: "Суптилни Вектори на Различноста",
    instruction: "Притиснете SPACEBAR за генерирање вектори"
  },
  "Mongolian": {
    title: "Өөр байдлын нарийн векторууд",
    instruction: "Вектор үүсгэхийн тулд SPACEBAR дарна уу"
  },
  "Kazakh": {
    title: "Басқалықтың Нәзік Векторлары",
    instruction: "Векторларды жасау үшін SPACEBAR басыңыз"
  },
  "Uzbek": {
    title: "Boshqalik Nozik Vektorlari",
    instruction: "Vektorlar yaratish uchun SPACEBAR bosing"
  },
  "Tajik": {
    title: "Вектороти Нозуки Дигарӣ",
    instruction: "Барои офаридани векторҳо SPACEBAR-ро пахш кунед"
  },
  "Kyrgyz": {
    title: "Башкачылыктын Нечке Векторлору",
    instruction: "Векторлорду түзүү үчүн SPACEBAR басыңыз"
  },
  "Armenian": {
    title: "Այլությունների Նուրբ Վեկտորները",
    instruction: "Վեկտորներ ստեղծելու համար սեղմեք SPACEBAR"
  },
  "Georgian": {
    title: "სხვაობის ნაზი ვექტორები",
    instruction: "ვექტორების შესაქმნელად დააჭირეთ SPACEBAR-ს"
  },
  "Azerbaijani": {
    title: "Başqalığın İncə Vektorları",
    instruction: "Vektorlar yaratmaq üçün SPACEBAR basın"
  },
  "Malay": {
    title: "Vektor Halus Keterasingan",
    instruction: "Tekan SPACEBAR untuk menjana vektor"
  },
  "Filipino": {
    title: "Mga Pinong Vector ng Kaibahan",
    instruction: "Pindutin ang SPACEBAR upang makagawa ng mga vector"
  },
  "Burmese": {
    title: "ကွဲပြားမှု၏ နုံ့ဆမ်းသော ဗက်တာများ",
    instruction: "ဗက်တာများဖန်တီးရန် SPACEBAR ကို နှိပ်ပါ"
  },
  "Khmer": {
    title: "វ៉ិចទ័រដ៏ស៊ីវិល័យនៃភាពខុសគ្នា",
    instruction: "ចុច SPACEBAR ដើម្បីបង្កើតវ៉ិចទ័រ"
  },
  "Lao": {
    title: "ເວັກເຕີທີ່ລະອຽດອ່ອນຂອງຄວາມແຕກຕ່າງ",
    instruction: "ກົດ SPACEBAR ເພື່ອສ້າງເວັກເຕີ"
  },
  "Nepali": {
    title: "अन्यताका सूक्ष्म भेक्टरहरू",
    instruction: "भेक्टरहरू उत्पादन गर्न SPACEBAR थिच्नुहोस्"
  },
  "Sinhala": {
    title: "අන්යභාවයේ සියුම් දෛශික",
    instruction: "දෛශික නිර්මාණය කිරීමට SPACEBAR එබන්න"
  },
  "Icelandic": {
    title: "Fágaðir Vigrar Óskyldleika",
    instruction: "Ýttu á BILSTÖNG til að búa til vigra"
  },
  "Scottish Gaelic": {
    title: "Vectoran Caola na h-Eile",
    instruction: "Brùth SPACEBAR gus vectoran a chruthachadh"
  },
  "Esperanto": {
    title: "Subtilaj Vektoroj de Alieco",
    instruction: "Premu SPACEBAR por krei vektorojn"
  },
  "Latin": {
    title: "Vectores Subtiles Alteritatis",
    instruction: "Preme SPATIUM ad vectores generandos"
  },
  "Sanskrit": {
    title: "अन्यत्वस्य सूक्ष्म सदिशाः",
    instruction: "सदिशान् उत्पादयितुं SPACEBAR नुदन्तु"
  },
  "Pashto": {
    title: "د بلتون ښکلي ویکټورونه",
    instruction: "د ویکټورونو جوړولو لپاره SPACEBAR فشار ورکړئ"
  },
  "Dari": {
    title: "وکتورهای ظریف دیگری",
    instruction: "برای ایجاد وکتورها SPACEBAR را فشار دهید"
  },
  "Kurdish": {
    title: "Vektorên Zirav ên Cudahiyê",
    instruction: "Ji bo çêkirina vektoran SPACEBAR bikişîne"
  },
  "Tibetan": {
    title: "གཞན་དབང་གི་ཕྲ་མོའི་ཁ་ཕྱོགས།",
    instruction: "ཁ་ཕྱོགས་བཟོ་བའི་ཆེད་དུ་ SPACEBAR མནན་རོགས།"
  },
  "Indonesian": {
    title: "Vektor Halus Keterasingan",
    instruction: "Tekan SPACEBAR untuk membuat vektor"
  }
};

// Memory system to prevent repetition and build contextual awareness
let usedQuotes = new Set(); // Store hash of used quotes
let usedAuthors = new Set(); // Store used author names
let generationHistory = []; // Store full generation context
let contextualMemory = []; // Store themes and patterns from previous generations

// Languages for the installation
const languages = [
  "English", "Spanish", "French", "German", "Portuguese", "Arabic", 
  "Mandarin Chinese", "Hindi", "Swahili", "Quechua", "Nahuatl", "Cherokee",
  "Russian", "Hebrew", "Yoruba", "Korean", "Vietnamese", "Tagalog",
  "Dutch", "Italian", "Polish", "Romanian", "Inuktitut", "Maori", "Amharic"
];

// Simple hash function for quotes
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Check if quote/author was already used
function isAlreadyUsed(quote, author) {
  let quoteHash = hashString(quote.toLowerCase().trim());
  let authorName = author.toLowerCase().trim();
  
  return usedQuotes.has(quoteHash) || usedAuthors.has(authorName);
}

// Add to memory
function extractContextualThemes(content) {
  // Extract key themes and patterns from the quote for building memory
  const themes = {
    era: null,
    ideology: null,
    oppression_type: null,
    subtlety_level: null
  };
  
  // Simple keyword detection for thematic patterns
  const text = content.toLowerCase();
  
  // Detect historical eras
  if (text.includes('20') && (text.includes('21') || text.includes('22') || text.includes('23') || text.includes('24'))) {
    themes.era = 'contemporary';
  } else if (text.includes('19') || text.includes('20th')) {
    themes.era = 'modern';
  } else {
    themes.era = 'historical';
  }
  
  // Detect ideological patterns
  if (text.includes('racial') || text.includes('race') || text.includes('superior')) {
    themes.ideology = 'racial supremacy';
  } else if (text.includes('colonial') || text.includes('civiliz') || text.includes('primitive')) {
    themes.ideology = 'colonialism';
  } else if (text.includes('gender') || text.includes('women') || text.includes('feminine')) {
    themes.ideology = 'gender oppression';
  } else {
    themes.ideology = 'systemic oppression';
  }
  
  // Detect subtlety level based on language patterns
  if (text.includes('inferior') || text.includes('savage') || text.includes('subhuman') || text.includes('vermin')) {
    themes.subtlety_level = 'overt';
  } else if (text.includes('cultural differences') || text.includes('natural order') || text.includes('tradition') || text.includes('family values') || text.includes('meritocracy')) {
    themes.subtlety_level = 'subtle';
  } else if (text.includes('scientific') || text.includes('research shows') || text.includes('studies indicate') || text.includes('data suggests')) {
    themes.subtlety_level = 'academic';
  } else {
    themes.subtlety_level = 'moderate';
  }
  
  return themes;
}

function addToMemory(quote, author) {
  let quoteHash = hashString(quote.toLowerCase().trim());
  let authorName = author.toLowerCase().trim();
  
  usedQuotes.add(quoteHash);
  usedAuthors.add(authorName);
  
  // Extract themes for contextual memory
  const themes = extractContextualThemes(quote);
  contextualMemory.push(themes);
  
  // Keep only last 5 contextual memories to build upon
  if (contextualMemory.length > 5) {
    contextualMemory.shift();
  }
  
  generationHistory.push({
    quote: quote.substring(0, 100) + "...", // Store first 100 chars for reference
    author: authorName,
    timestamp: Date.now(),
    themes: themes
  });
  
  // Keep only last 50 generations to prevent memory issues
  if (generationHistory.length > 50) {
    generationHistory.shift();
  }
}

function getCurrentInterfaceText() {
  // Get interface text for current language, fallback to English
  return translations[selectedLanguage] || translations["English"];
}

function drawLanguageMenu(p) {
  // Language menu button - ensure it stays within canvas bounds
  let buttonW = 100;
  let buttonH = 30;
  let buttonX = Math.max(10, p.width - buttonW - 20); // Min 10px from left edge
  let buttonY = 15; // Smaller top margin
  
  // Draw button
  p.fill(showLanguageMenu ? p.color(200) : p.color(240));
  p.stroke(p.color(100));
  p.strokeWeight(1);
  p.rect(buttonX, buttonY, buttonW, buttonH, 5);
  
  // Button text
  p.fill(p.color(50));
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.textFont('Arial, sans-serif');
  p.noStroke();
  p.text(selectedLanguage, buttonX + buttonW/2, buttonY + buttonH/2);
  
  // Store button bounds for click detection
  languageMenuButton = {x: buttonX, y: buttonY, w: buttonW, h: buttonH};
  
  // Draw dropdown menu if open
  if (showLanguageMenu) {
    let menuY = buttonY + buttonH + 5;
    let menuItemHeight = 20; // Compact height for more languages
    let maxVisible = 20; // Show more languages at once
    let menuHeight = maxVisible * menuItemHeight;
    
    // Ensure scroll offset doesn't go out of bounds
    let maxScroll = Math.max(0, availableLanguages.length - maxVisible);
    languageScrollOffset = Math.max(0, Math.min(languageScrollOffset, maxScroll));
    
    // Menu background
    p.fill(p.color(255, 250));
    p.stroke(p.color(100));
    p.strokeWeight(1);
    p.rect(buttonX, menuY, buttonW, menuHeight, 3);
    
    // Menu items with scrolling
    p.noStroke();
    for (let i = 0; i < maxVisible && (i + languageScrollOffset) < availableLanguages.length; i++) {
      let langIndex = i + languageScrollOffset;
      let itemY = menuY + i * menuItemHeight;
      let lang = availableLanguages[langIndex];
      
      // Highlight if hovered
      if (p.mouseX >= buttonX && p.mouseX <= buttonX + buttonW && 
          p.mouseY >= itemY && p.mouseY <= itemY + menuItemHeight) {
        p.fill(p.color(220, 240, 255));
        p.rect(buttonX, itemY, buttonW, menuItemHeight);
      }
      
      // Text
      p.fill(selectedLanguage === lang ? p.color(0, 100, 200) : p.color(50));
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(10);
      p.text(lang, buttonX + 8, itemY + menuItemHeight/2);
    }
    
    // Scroll indicators
    if (languageScrollOffset > 0) {
      // Up arrow
      p.fill(p.color(100));
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text("▲", buttonX + buttonW - 15, menuY + 10);
    }
    if (languageScrollOffset < maxScroll) {
      // Down arrow
      p.fill(p.color(100));
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.text("▼", buttonX + buttonW - 15, menuY + menuHeight - 10);
    }
    
    // Language count indicator
    p.fill(p.color(120));
    p.textAlign(p.RIGHT, p.CENTER);
    p.textSize(8);
    p.text(`${languageScrollOffset + 1}-${Math.min(languageScrollOffset + maxVisible, availableLanguages.length)} of ${availableLanguages.length}`, 
           buttonX + buttonW - 20, menuY + menuHeight + 12);
  }
}

function handleLanguageMenuClick(p, mouseX, mouseY) {
  // Check if clicking on menu button
  if (languageMenuButton && 
      mouseX >= languageMenuButton.x && mouseX <= languageMenuButton.x + languageMenuButton.w &&
      mouseY >= languageMenuButton.y && mouseY <= languageMenuButton.y + languageMenuButton.h) {
    showLanguageMenu = !showLanguageMenu;
    return true;
  }
  
  // Check if clicking on menu items
  if (showLanguageMenu && languageMenuButton) {
    let menuY = languageMenuButton.y + languageMenuButton.h + 5;
    let menuItemHeight = 20;
    let maxVisible = 20;
    let menuHeight = maxVisible * menuItemHeight;
    
    // Check if clicking on scroll arrows
    if (mouseX >= languageMenuButton.x + languageMenuButton.w - 25 && 
        mouseX <= languageMenuButton.x + languageMenuButton.w) {
      if (mouseY >= menuY && mouseY <= menuY + 20 && languageScrollOffset > 0) {
        // Up arrow clicked
        languageScrollOffset = Math.max(0, languageScrollOffset - 5);
        return true;
      } else if (mouseY >= menuY + menuHeight - 20 && mouseY <= menuY + menuHeight && 
                 languageScrollOffset < availableLanguages.length - maxVisible) {
        // Down arrow clicked
        languageScrollOffset = Math.min(availableLanguages.length - maxVisible, languageScrollOffset + 5);
        return true;
      }
    }
    
    // Check if clicking on language items
    if (mouseX >= languageMenuButton.x && mouseX <= languageMenuButton.x + languageMenuButton.w &&
        mouseY >= menuY && mouseY <= menuY + menuHeight) {
      
      let itemIndex = Math.floor((mouseY - menuY) / menuItemHeight);
      let langIndex = itemIndex + languageScrollOffset;
      
      if (itemIndex >= 0 && itemIndex < maxVisible && langIndex < availableLanguages.length) {
        selectedLanguage = availableLanguages[langIndex];
        showLanguageMenu = false;
        languageScrollOffset = 0; // Reset scroll when language is selected
        return true;
      }
    }
  }
  
  // Close menu if clicking elsewhere
  if (showLanguageMenu) {
    showLanguageMenu = false;
    return true;
  }
  
  return false;
}

// Professional p5.js layout functions
function renderProfessionalLayout(p, quote, author, context) {
  // Calculate safe layout boundaries
  let margin = p.width * 0.15; // 15% margin on each side
  let contentWidth = p.width - (margin * 2);
  
  // Font sizes based on content type
  let quoteFontSize = Math.min(24, p.width / 40);
  let authorFontSize = Math.min(16, p.width / 60);
  let contextFontSize = Math.min(12, p.width / 80);
  
  // Line heights for good readability
  let quoteLineHeight = quoteFontSize * 1.4;
  let authorLineHeight = authorFontSize * 1.3;
  let contextLineHeight = contextFontSize * 1.5;
  
  // Layout the quote text
  p.push();
  p.textAlign(p.CENTER, p.TOP);
  p.textFont('Georgia, Times, serif');
  p.textSize(quoteFontSize);
  p.fill(0); // Black text on white background
  
  // Wrap quote text with safe width (70% of content width)
  let quoteWidth = contentWidth * 0.7;
  let quoteLines = wrapTextP5(p, quote, quoteWidth);
  
  // Calculate total content height
  let quoteHeight = quoteLines.length * quoteLineHeight;
  let authorHeight = authorLineHeight;
  let contextHeight = 0;
  
  // Wrap context text with safer width (60% of content width)
  let contextLines = [];
  if (context) {
    p.textSize(contextFontSize);
    let contextWidth = contentWidth * 0.6;
    contextLines = wrapTextP5(p, context, contextWidth);
    contextHeight = contextLines.length * contextLineHeight;
  }
  
  let totalHeight = quoteHeight + 40 + authorHeight + (contextHeight > 0 ? 30 + contextHeight : 0);
  
  // Center vertically
  let startY = (p.height - totalHeight) / 2;
  let currentY = startY;
  
  // Render quote
  p.textSize(quoteFontSize);
  p.fill(0);
  for (let line of quoteLines) {
    p.text(line, p.width / 2, currentY);
    currentY += quoteLineHeight;
  }
  
  currentY += 40; // Space before author
  
  // Render author
  p.textSize(authorFontSize);
  p.fill(60); // Slightly dimmed
  p.textStyle(p.ITALIC);
  p.text(author, p.width / 2, currentY);
  p.textStyle(p.NORMAL);
  
  currentY += authorHeight + 30; // Space before context
  
  // Render context
  if (contextLines.length > 0) {
    p.textSize(contextFontSize);
    p.fill(90); // Dimmed for context
    p.textFont('Arial, sans-serif');
    
    for (let line of contextLines) {
      // Safety check - don't overflow screen
      if (currentY + contextLineHeight < p.height - 30) {
        p.text(line, p.width / 2, currentY);
        currentY += contextLineHeight;
      } else {
        // Show truncation if needed
        p.text('...', p.width / 2, currentY);
        break;
      }
    }
  }
  
  p.pop();
}

// Simple, reliable text wrapping function using p5.js
function wrapTextP5(p, text, maxWidth) {
  let words = text.split(' ');
let lines = [];
  let currentLine = '';
  
  for (let word of words) {
    let testLine = currentLine + (currentLine ? ' ' : '') + word;
    
    if (p.textWidth(testLine) > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word too long - break it
        if (p.textWidth(word) > maxWidth) {
          let chars = word.split('');
          let partialWord = '';
          for (let char of chars) {
            if (p.textWidth(partialWord + char) > maxWidth) {
              if (partialWord) lines.push(partialWord);
              partialWord = char;
            } else {
              partialWord += char;
            }
          }
          currentLine = partialWord;
        } else {
          currentLine = word;
        }
      }
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

function getRandomLanguages() {
  // Select 3 random languages excluding English (which is always included)
  let availableLanguages = languages.filter(lang => lang !== "English");
  let selectedLanguages = [];
  
  for (let i = 0; i < 3; i++) {
    let randomIndex = Math.floor(Math.random() * availableLanguages.length);
    selectedLanguages.push(availableLanguages[randomIndex]);
    availableLanguages.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  return ["English", ...selectedLanguages]; // Always include English first
}



const sketch = p => {
  p.preload = function() {
    // Preload the sound
    sampleSound = p.loadSound('/sample.mp3'); // Adjust path as necessary
  };

  p.setup = function() {
    // Create full window canvas
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.fill(p.color('black'));
    p.textSize(24);
    p.textFont('Georgia, Times, serif');
    
    // Remove any default margins and make canvas fill entire window
    let canvas = p.canvas;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '0';
    
    // Keep loader visible until user interaction
    // isLoading starts as true and stays true until spacebar is pressed
  };

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.keyPressed = function() {
    if (p.keyCode === 80) { // Keycode for 'P'
      if (!isSoundPlaying) {
        sampleSound.play();
        isSoundPlaying = true;
      } else {
        sampleSound.stop();
        isSoundPlaying = false;
      }
    } else if (p.keyCode === 32) { // Existing functionality for space key
      isLoading = true;
      
      // Accelerate animation when generating new content
      targetSpeed = 4.0; // Fast during generation - dramatic contrast
      
      // Create memory context to avoid repetition and build thematic awareness
      let memoryContext = "";
      
      // Build contextual memory from previous generations
      let thematicContext = '';
      if (contextualMemory.length > 0) {
        const recentThemes = contextualMemory.slice(-3);
        const themesSummary = recentThemes.map(t => `${t.era} ${t.ideology}`).join(', ');
        const subtletyLevels = recentThemes.map(t => t.subtlety_level).filter(Boolean);
        
        // Balance overt vs subtle oppression
        let balanceGuidance = '';
        if (subtletyLevels.length > 0) {
          const recentOvert = subtletyLevels.filter(s => s === 'overt').length;
          const recentSubtle = subtletyLevels.filter(s => s === 'subtle' || s === 'academic').length;
          
          if (recentOvert > recentSubtle) {
            balanceGuidance = ' PRIORITIZE a subtle or academically-disguised quote that demonstrates how oppression hides behind seemingly reasonable language.';
          } else if (recentSubtle > recentOvert) {
            balanceGuidance = ' PRIORITIZE a more overtly oppressive quote that clearly reveals discriminatory thinking.';
          } else {
            balanceGuidance = ' MAINTAIN balance between overt and subtle forms of oppression.';
          }
        }
        
        thematicContext = `\n\nCONTEXTUAL MEMORY: Previous quotes explored these patterns: ${themesSummary}. Build upon these themes while exploring new dimensions of oppression.${balanceGuidance} Connect this quote to the historical continuum of harm, showing how past ideologies inform present-day discrimination.`;
      }
      
      if (generationHistory.length > 0) {
        let recentAuthors = generationHistory.slice(-15).map(h => h.author).join(", ");
        memoryContext = `\n\nCRITICAL: DO NOT repeat ANY quotes or authors. These authors were recently used and are FORBIDDEN: ${recentAuthors}. You MUST select a completely different person not in this list.${thematicContext}`;
      } else {
        memoryContext = `\n\nFocus on subtle, intellectual forms of oppression disguised as reasonable discourse.${thematicContext}`;
      }
      
      chat(`This is "Subtle Vectors of Otherness" - an art installation that reveals how oppression creates "otherness" through seemingly innocent statements. Generate ONE REAL, VERIFIED historical quote that demonstrates how language creates division and exclusion.

CRITICAL REQUIREMENTS:
1. QUOTE: One real, documented quote that appears reasonable but creates "otherness"
2. ATTRIBUTION: Full name, title/role, exact date, and source (book, speech, document)
3. OTHERNESS EXPLANATION: Explain specifically HOW this quote generates "otherness" - how it creates division, exclusion, or marginalization of certain groups

Focus on statements that CREATE OTHERNESS through:
- Defining who belongs vs. who doesn't belong
- Creating hierarchies that place some groups as "lesser" or "different"
- Using "us vs. them" language disguised as objective analysis
- Establishing norms that exclude or marginalize certain identities
- Paternalistic language that positions some groups as needing guidance/control
- Academic/scientific language that categorizes people as fundamentally different
- Coded language about "merit," "culture," "tradition" that excludes certain groups

AVOID overtly hateful statements. Focus on subtle mechanisms that create social divisions and exclusion while appearing reasonable or scientific.

Choose from: academics, scientists, philosophers, economists, psychologists, anthropologists, educators, policy makers, cultural commentators (1950-2024).

Present the quote in ${selectedLanguage}.${memoryContext}

Format:

[quote in ${selectedLanguage}]

— Full Name, Title/Role (Exact Date, Source)

Context: [OTHERNESS ANALYSIS: Explain specifically HOW this quote creates "otherness" - what groups it positions as "other," how it establishes boundaries between "us" and "them," what assumptions it makes about who is normal/abnormal, included/excluded, worthy/unworthy. Describe the mechanism of exclusion and its impact on marginalized communities. SOURCE VERIFICATION: Confirm the quote's authenticity and provide the specific source.]`);
    }
  };
 
  async function chat(prompt) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        temperature: 0.8,
        messages: [{ "role": "user", "content": prompt }]
      });

      textToShow = completion.choices[0].message.content;
      
      // Extract and store quote and author for memory system
      if (textToShow.includes('—')) {
        let authorSplit = textToShow.split('—');
        let quote = authorSplit[0].trim();
        let authorPart = authorSplit[1].trim();
        
        // Extract just the author name (before Context:)
        let authorName = authorPart.split('Context:')[0].trim();
        
        // Clean up author name - remove year parentheses and extra text
        authorName = authorName.replace(/\(\d{4}\)/g, '').trim();
        authorName = authorName.replace(/\s+/g, ' ').trim();
        
        // Check if this exact author was already used
        if (usedAuthors.has(authorName.toLowerCase())) {
          console.warn(`WARNING: Author "${authorName}" was already used! Memory system failed.`);
        }
        
        // Add to memory to prevent future repetition
        addToMemory(quote, authorName);
        
        console.log(`Added to memory: "${authorName}" - Total stored: ${generationHistory.length}`);
        console.log(`Recent authors: ${Array.from(usedAuthors).slice(-5).join(', ')}`);
      }
      
      // Slow down animation when content is ready
      targetSpeed = 1.0; // Calm for reading
      
      isLoading = false;
    } catch (err) {
      console.error("An error occurred in the chat function:", err);
      targetSpeed = 1.0; // Reset speed on error too
      isLoading = false;
    }
  }





  p.draw = function() {
    p.background(p.color(255));

    // Always draw the language menu
    drawLanguageMenu(p);

    if (isLoading) {
      displayLoader(p);
    } else {
             // Format and display the text with proper styling and margins
       if (textToShow.includes('—')) {
         // Clean and parse quote, author, and context with careful formatting
         let cleanText = textToShow.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
         cleanText = cleanText.replace(/\s+/g, ' '); // Normalize multiple spaces
         
         let authorSplit = cleanText.split('—');
         let quote = authorSplit[0].trim();
         let authorAndContext = authorSplit[1].trim();
         
         // Remove brackets from quote if present and clean formatting
         quote = quote.replace(/^\[|\]$/g, '').trim();
         quote = quote.replace(/^["'""\u201C\u201D]+|["'""\u201C\u201D]+$/g, '').trim(); // Remove quotes at start/end
         
         let contextSplit = authorAndContext.split('Context:');
         let authorText = contextSplit[0].trim();
         let contextText = contextSplit.length > 1 ? contextSplit[1].trim() : '';
         
         // Clean and format author
         authorText = authorText.replace(/^[.,\s]+|[.,\s]+$/g, ''); // Remove extra punctuation
         let author = '— ' + authorText;
         
         // Clean and format context
         let context = '';
         if (contextText) {
           contextText = contextText.replace(/^[.,\s]+|[.,\s]+$/g, ''); // Remove extra punctuation
           if (!contextText.endsWith('.') && !contextText.endsWith('!') && !contextText.endsWith('?')) {
             contextText += '.'; // Ensure proper ending punctuation
           }
           context = contextText;
         }
         
         // Professional p5.js text layout system with guaranteed no overflow
         function chunkTextByWidth(text, maxWidth, textSize, font) {
           // Set text properties for measurement using p5.js
           p.push(); // Save current state
           p.textSize(textSize);
           p.textFont(font);
           
           // Ultra-conservative width for ALL languages - guaranteed no overflow
           let safeMaxWidth = maxWidth * 0.5; // Use only 50% for absolute safety across all languages
           

           
           // Handle different text splitting for various languages
           let words;
           let separator = ' ';
           
           // Check if text contains CJK characters (Chinese, Japanese, Korean)
           if (/[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(text)) {
             // For CJK languages, can break at character level if needed
             words = text.split('');
             separator = '';
           } else if (/[\u0600-\u06ff\u0750-\u077f\u0590-\u05ff]/.test(text)) {
             // Arabic/Hebrew - handle RTL text carefully
             words = text.split(' ');
             separator = ' ';
           } else {
             // Standard word-based splitting for most languages
             words = text.split(' ');
             separator = ' ';
           }
           
           let lines = [];
           let currentLine = '';
           
           for (let i = 0; i < words.length; i++) {
             let word = words[i];
             let testLine = currentLine + (currentLine && separator ? separator : '') + word;
             let lineWidth = p.textWidth(testLine);
             
             if (lineWidth <= safeMaxWidth) {
               currentLine = testLine;
             } else {
               if (currentLine) {
                 // Verify line width before adding
                 if (p.textWidth(currentLine) <= safeMaxWidth) {
                   lines.push(currentLine);
                 }
                 currentLine = word;
               } else {
                 // Single word too long - force character-level break
                 console.warn('Breaking long word:', word);
                 let chars = word.split('');
                 let brokenPart = '';
                 for (let char of chars) {
                   let testChar = brokenPart + char;
                   if (p.textWidth(testChar) <= safeMaxWidth) {
                     brokenPart = testChar;
                   } else {
                     if (brokenPart) {
                       lines.push(brokenPart);
                       brokenPart = char;
                     } else {
                       // Single character still too wide - force it anyway
                       lines.push(char);
                       brokenPart = '';
                     }
                   }
                 }
                 currentLine = brokenPart;
               }
             }
           }
           
           if (currentLine && p.textWidth(currentLine) <= safeMaxWidth) {
             lines.push(currentLine);
           }
           
           p.pop(); // Restore previous state
           return lines;
         }
         
         // Professional p5.js layout renderer - clean, safe, and well-designed
         function renderProfessionalLayout(quote, author, context) {
           // Calculate safe layout boundaries
           let margin = p.width * 0.15; // 15% margin on each side
           let contentWidth = p.width - (margin * 2);
           let contentHeight = p.height * 0.8; // Use 80% of height
           
           // Font sizes based on content type
           let quoteFontSize = Math.min(24, p.width / 40);
           let authorFontSize = Math.min(16, p.width / 60);
           let contextFontSize = Math.min(12, p.width / 80);
           
           // Line heights for good readability
           let quoteLineHeight = quoteFontSize * 1.4;
           let authorLineHeight = authorFontSize * 1.3;
           let contextLineHeight = contextFontSize * 1.5;
           
           // Layout the quote text
           p.push();
           p.textAlign(p.CENTER, p.TOP);
           p.textFont('Georgia, Times, serif');
           p.textSize(quoteFontSize);
           p.fill(255); // White text
           
           // Wrap quote text with safe width (70% of content width)
           let quoteWidth = contentWidth * 0.7;
           let quoteLines = wrapText(quote, quoteWidth);
           
           // Calculate total content height
           let quoteHeight = quoteLines.length * quoteLineHeight;
           let authorHeight = authorLineHeight;
           let contextHeight = 0;
           
           // Wrap context text with safer width (60% of content width)
           let contextLines = [];
           if (context) {
             p.textSize(contextFontSize);
             let contextWidth = contentWidth * 0.6;
             contextLines = wrapText(context, contextWidth);
             contextHeight = contextLines.length * contextLineHeight;
           }
           
           let totalHeight = quoteHeight + 40 + authorHeight + (contextHeight > 0 ? 30 + contextHeight : 0);
           
           // Center vertically
           let startY = (p.height - totalHeight) / 2;
           let currentY = startY;
           
           // Render quote
           p.textSize(quoteFontSize);
           p.fill(255);
           for (let line of quoteLines) {
             p.text(line, p.width / 2, currentY);
             currentY += quoteLineHeight;
           }
           
           currentY += 40; // Space before author
           
           // Render author
           p.textSize(authorFontSize);
           p.fill(200); // Slightly dimmed
           p.textStyle(p.ITALIC);
           p.text(author, p.width / 2, currentY);
           p.textStyle(p.NORMAL);
           
           currentY += authorHeight + 30; // Space before context
           
           // Render context
           if (contextLines.length > 0) {
             p.textSize(contextFontSize);
             p.fill(150); // Dimmed for context
             p.textFont('Arial, sans-serif');
             
             for (let line of contextLines) {
               // Safety check - don't overflow screen
               if (currentY + contextLineHeight < p.height - 30) {
                 p.text(line, p.width / 2, currentY);
                 currentY += contextLineHeight;
               } else {
                 // Show truncation if needed
                 p.text('...', p.width / 2, currentY);
        break;
      }
    }
           }
           
           p.pop();
         }
         
         // Simple, reliable text wrapping function using p5.js
         function wrapText(text, maxWidth) {
           let words = text.split(' ');
           let lines = [];
           let currentLine = '';
           
           for (let word of words) {
             let testLine = currentLine + (currentLine ? ' ' : '') + word;
             
             if (p.textWidth(testLine) > maxWidth) {
               if (currentLine) {
                 lines.push(currentLine);
                 currentLine = word;
    } else {
                 // Word too long - break it
                 if (p.textWidth(word) > maxWidth) {
                   let chars = word.split('');
                   let partialWord = '';
                   for (let char of chars) {
                     if (p.textWidth(partialWord + char) > maxWidth) {
                       if (partialWord) lines.push(partialWord);
                       partialWord = char;
                     } else {
                       partialWord += char;
                     }
                   }
                   currentLine = partialWord;
                 } else {
                   currentLine = word;
                 }
               }
             } else {
               currentLine = testLine;
             }
           }
           
           if (currentLine) lines.push(currentLine);
           return lines;
         }
         
         // Calculate layout with extra generous margins - even larger for non-English
         let marginPercent = selectedLanguage === 'English' ? 0.18 : 0.22; // 22% margin for non-English
         let sideMargin = Math.max(p.width * marginPercent, 50); // Larger minimum margin too
         let contentWidth = p.width - (sideMargin * 2);
         
         // Additional safety margin for text measurement accuracy - ultra-conservative
         contentWidth = contentWidth * 0.8; // Use only 80% of calculated width for extreme safety
         
         // Select appropriate fonts for different language scripts
         function getFontForLanguage(lang) {
           // Handle different script families
           if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(lang)) { // Chinese
             return 'SimSun, "Microsoft YaHei", sans-serif';
           } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(lang)) { // Japanese
             return '"Hiragino Sans", "Yu Gothic", sans-serif';
           } else if (/[\uac00-\ud7af]/.test(lang)) { // Korean
             return '"Malgun Gothic", "Noto Sans KR", sans-serif';
           } else if (/[\u0600-\u06ff\u0750-\u077f]/.test(lang)) { // Arabic
             return '"Noto Sans Arabic", "Arabic Typesetting", serif';
           } else if (/[\u0590-\u05ff]/.test(lang)) { // Hebrew
             return '"Noto Sans Hebrew", "Times New Roman", serif';
           } else if (/[\u0900-\u097f]/.test(lang)) { // Devanagari (Hindi, Sanskrit)
             return '"Noto Sans Devanagari", "Mangal", sans-serif';
           } else if (/[\u0980-\u09ff]/.test(lang)) { // Bengali
             return '"Noto Sans Bengali", "Vrinda", sans-serif';
           } else if (/[\u0f00-\u0fff]/.test(lang)) { // Tibetan
             return '"Noto Sans Tibetan", "Microsoft Himalaya", serif';
           } else {
             return 'Georgia, Times, serif'; // Default for Latin scripts
           }
         }
         
         let quoteFontFamily = getFontForLanguage(quote);
         let contextFontFamily = getFontForLanguage(context || ''); // Use consistent font
         
         // Chunk text based on actual pixel width to prevent overflow - extra conservative
         let quoteWidth = contentWidth * 0.9; // Even more conservative for quotes
         let quoteLines = chunkTextByWidth(quote, quoteWidth, 22, quoteFontFamily);
         
         // Use ULTRA conservative width for context/explanation text - guarantee no overflow
         let contextWidth;
         if (selectedLanguage === 'English') {
           contextWidth = contentWidth * 0.3; // Ultra conservative for English
         } else {
           contextWidth = contentWidth * 0.2; // Extremely narrow for non-English languages
         }
         
         // Use appropriate font for context based on language
         let contextFont = getFontForLanguage(context || '');
         let contextLines = context ? chunkTextByWidth(context, contextWidth, 10, contextFont) : []; // Ultra-small font for guaranteed fit
         

         let quoteLineHeight = 34; // More breathing room for quotes
         let contextLineHeight = 24; // Better spacing for context
         let languageSeparator = 8; // Tighter between quote lines
         let sectionSpacing = 40; // Clear separation between quote and author
         let authorSpacing = 30; // Clear separation between author and context
         
         // Calculate total height more carefully
         let totalQuoteHeight = quoteLines.length * quoteLineHeight + 
                               (quoteLines.length > 1 ? (quoteLines.length - 1) * languageSeparator : 0);
         let authorHeight = 20;
         let contextHeight = contextLines.length > 0 ? (contextLines.length * contextLineHeight) : 0;
         
         let totalHeight = totalQuoteHeight + sectionSpacing + authorHeight + 
                          (contextHeight > 0 ? authorSpacing + contextHeight : 0);
         
         // Ensure we don't go off screen and have proper margins
         let minTopMargin = 30;
         let minBottomMargin = 30;
         let maxHeight = p.height - (minTopMargin + minBottomMargin);
         
         // Iteratively reduce spacing and text if content is too tall
         let attempts = 0;
         while (totalHeight > maxHeight && attempts < 5) {
           attempts++;
           
           // Progressively reduce spacing, text size, and content width
           if (attempts === 1) {
             quoteLineHeight = 30;
             contextLineHeight = 22;
             sectionSpacing = 30;
             authorSpacing = 25;
             // Slightly reduce content width
             contentWidth = contentWidth * 0.95;
           } else if (attempts === 2) {
             quoteLineHeight = 26;
             contextLineHeight = Math.max(20, 16); // Minimum 16px line height
             sectionSpacing = 25;
             authorSpacing = 20;
             // Further reduce content width and re-chunk with much smaller context width
             contentWidth = contentWidth * 0.9;
             if (selectedLanguage === 'English') {
               contextWidth = contentWidth * 0.45;
             } else {
               contextWidth = contentWidth * 0.35; // Ultra aggressive for non-English
             }
             contextLines = context ? chunkTextByWidth(context, contextWidth, 10, contextFont) : [];
           } else if (attempts === 3) {
             quoteLineHeight = 24;
             contextLineHeight = Math.max(18, 16); // Minimum 16px line height
             sectionSpacing = 20;
             authorSpacing = 15;
             // Significantly reduce content width and re-chunk both with very small context width
             contentWidth = contentWidth * 0.85;
             quoteWidth = contentWidth * 0.9;
             if (selectedLanguage === 'English') {
               contextWidth = contentWidth * 0.4;
             } else {
               contextWidth = contentWidth * 0.3; // Extremely narrow for non-English
             }
             quoteLines = chunkTextByWidth(quote, quoteWidth, 20, quoteFontFamily);
             contextLines = context ? chunkTextByWidth(context, contextWidth, 9, contextFont) : [];
           } else {
             // Final attempt - very compact with minimal width
             quoteLineHeight = 22;
             contextLineHeight = Math.max(16, 14); // Absolute minimum 14px line height
             sectionSpacing = 15;
             authorSpacing = 12;
             contentWidth = contentWidth * 0.8;
             quoteWidth = contentWidth * 0.85;
             if (selectedLanguage === 'English') {
               contextWidth = contentWidth * 0.35;
             } else {
               contextWidth = contentWidth * 0.25; // Minimal width for non-English
             }
             quoteLines = chunkTextByWidth(quote, quoteWidth, 18, quoteFontFamily);
             contextLines = context ? chunkTextByWidth(context, contextWidth, 8, contextFont) : [];
           }
           
           // Recalculate total height with enforced minimum line heights
           totalQuoteHeight = quoteLines.length * quoteLineHeight + 
                             (quoteLines.length > 1 ? (quoteLines.length - 1) * languageSeparator : 0);
           contextHeight = contextLines.length > 0 ? (contextLines.length * Math.max(contextLineHeight, 14)) : 0;
           totalHeight = totalQuoteHeight + sectionSpacing + authorHeight + 
                        (contextHeight > 0 ? authorSpacing + contextHeight : 0);
         }
         
         // Calculate start position ensuring we stay within bounds
         let startY = Math.max(minTopMargin, (p.height - totalHeight) / 2);
         
         // Final safety check - if still too tall, start from top
         if (startY + totalHeight > p.height - minBottomMargin) {
           startY = minTopMargin;
         }
         
         let currentY = startY;
         
                 // Use the professional layout system
        renderProfessionalLayout(p, quote, author, context);
       } else {
         // Fallback for text without proper formatting
         p.textAlign(p.CENTER, p.CENTER);
         p.fill(p.color(50));
         p.textSize(20);
         let margin = p.width * 0.1;
         p.text(textToShow, margin, p.height / 2 - 50, p.width - (margin * 2), 100);
       }


    }
  };

  p.mousePressed = function() {
    // Handle language menu clicks
    return !handleLanguageMenuClick(p, p.mouseX, p.mouseY);
  };

  p.mouseWheel = function(event) {
    // Handle scrolling in language menu
    if (showLanguageMenu && languageMenuButton) {
      let menuY = languageMenuButton.y + languageMenuButton.h + 5;
      let menuItemHeight = 20;
      let maxVisible = 20;
      let menuHeight = maxVisible * menuItemHeight;
      
      // Check if mouse is over the menu
      if (p.mouseX >= languageMenuButton.x && p.mouseX <= languageMenuButton.x + languageMenuButton.w &&
          p.mouseY >= menuY && p.mouseY <= menuY + menuHeight) {
        
        let maxScroll = Math.max(0, availableLanguages.length - maxVisible);
        
        if (event.delta > 0) {
          // Scroll down
          languageScrollOffset = Math.min(maxScroll, languageScrollOffset + 3);
        } else {
          // Scroll up
          languageScrollOffset = Math.max(0, languageScrollOffset - 3);
        }
        
        return false; // Prevent default scrolling
      }
    }
  };
};

function displayLoader(p) {
  // Update animation speed with smooth transition
  animationSpeed = p.lerp(animationSpeed, targetSpeed, speedTransition);
  
  p.push();
  p.translate(p.width / 2, p.height / 2);

  // Multiple rotating vector lines - DYNAMIC SPEED
  for (let i = 0; i < 12; i++) {
  p.push();
    p.rotate((p.frameCount * animationSpeed / (30 + i * 8)) + (i * p.PI / 6)); // Faster base speed
    p.strokeWeight(4 + i * 1.2);
    p.stroke(120 + i * 8, 120 + i * 8, 120 + i * 8, 180 - i * 8);
    let lineLength = 100 + i * 50;
    p.line(0, 0, lineLength, 0);
  p.pop();
  }

  p.pop();
  
  // Display title and instructions with very transparent text
  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  
  // Get current interface text
  let interfaceText = getCurrentInterfaceText();
  
  // Title - positioned above the loader animation with liquid/responsive sizing
  p.fill(p.color(60, 60, 60, 80)); // Very transparent dark gray
  
  // Liquid font size based on screen width
  let liquidTitleSize = Math.max(24, Math.min(60, p.width * 0.035)); // 3.5% of screen width, min 24px, max 60px
  p.textSize(liquidTitleSize);
  p.textFont('Georgia, Times, serif');
  p.textStyle(p.NORMAL);
  p.text(interfaceText.title, p.width / 2, p.height / 2 - 200);
  
  // Author attribution removed
  
  // Instructions - positioned below the loader animation
  p.fill(p.color(90, 90, 90, 70)); // Very subtle
  p.textSize(14);
  p.textFont('Arial, Helvetica, sans-serif');
  p.textStyle(p.NORMAL);
  p.text(interfaceText.instruction, p.width / 2, p.height / 2 + 200); // Moved up slightly
  
  // Language information - speakers and region
  let langInfo = languageInfo[selectedLanguage];
  if (langInfo) {
    p.fill(p.color(120, 120, 120, 60)); // Even more subtle
    p.textSize(11);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(`${langInfo.speakers} speakers • ${langInfo.region}`, p.width / 2, p.height / 2 + 230);
  }
  
  p.pop();

  p.push();
  p.translate(p.width / 2, p.height / 2);
  
  // Counter-rotating vectors - DYNAMIC SPEED
  for (let i = 0; i < 10; i++) {
    p.push();
    p.rotate(-(p.frameCount * animationSpeed / (20 + i * 5)) + (i * p.PI / 5)); // Faster
    p.strokeWeight(3 + i * 0.8);
    p.stroke(80 + i * 15, 80 + i * 15, 80 + i * 15, 160 - i * 8);
    let lineLength = 120 + i * 40;
    p.line(0, 0, lineLength, 0);
  p.pop();
  }
  
  // Radial vectors expanding and contracting - DYNAMIC SPEED
  for (let i = 0; i < 18; i++) {
  p.push();
    p.rotate(i * p.PI / 9);
    p.strokeWeight(2 + (i % 3));
    p.stroke(140, 140, 140, 120 - i * 3);
    let pulse = p.sin(p.frameCount * animationSpeed * 0.08 + i) * 80 + 150; // Faster pulse
    p.line(0, 0, pulse, 0);
  p.pop();
  }
  
  // Outer rotating arms - DYNAMIC SPEED
  for (let i = 0; i < 6; i++) {
    p.push();
    p.rotate((p.frameCount * animationSpeed / 15) + (i * p.PI / 3)); // Faster
    p.strokeWeight(8);
    p.stroke(60, 60, 60, 140);
    p.line(0, 0, 200 + p.sin(p.frameCount * animationSpeed * 0.06 + i) * 50, 0); // Faster oscillation
    p.pop();
  }
  
  // Central pulsing circles - DYNAMIC SPEED
  for (let i = 0; i < 3; i++) {
  p.push();
    p.noFill();
    p.strokeWeight(3 + i);
    p.stroke(100 + i * 30, 100 + i * 30, 100 + i * 30, 160 - i * 40);
    let radius = p.sin(p.frameCount * animationSpeed * 0.12 + i) * 25 + 40 + i * 15; // Faster pulse
    p.circle(0, 0, radius);
    p.pop();
  }
  
  p.pop();
}
function onReady() {
  openai = new OpenAI({
    apiKey: openAIKey,
    dangerouslyAllowBrowser: true
  });

  const mainElt = document.querySelector('main');
  new p5(sketch, mainElt);
}

if (document.readyState === 'complete') {
  onReady();
} else {
  document.addEventListener("DOMContentLoaded", onReady);
}



