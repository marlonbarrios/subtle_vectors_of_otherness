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

// Scrolling animation variables
let scrollOffset = 0; // Current scroll position
let scrollSpeed = 0.24; // Pixels per frame to scroll (20% faster)
let isScrolling = false; // Whether text is currently scrolling

// Auto-generation variables
let lastGenerationTime = 0; // Timestamp of last generation
let autoGenerationInterval = 120000; // 120 seconds = 2 minutes
let continuousMode = false; // Whether continuous generation is active

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

// Definition of the artwork in multiple languages
const artworkDefinitions = {
  "English": "An interactive installation generating philosophical wisdom about recognizing and addressing microaggressions and subtle vectors of otherness in daily life.",
  "Spanish": "Una instalación interactiva que genera sabiduría filosófica sobre el reconocimiento y abordaje de microagresiones y vectores sutiles de alteridad en la vida cotidiana.",
  "French": "Une installation interactive générant une sagesse philosophique sur la reconnaissance et le traitement des microagressions et des vecteurs subtils d'altérité dans la vie quotidienne.",
  "German": "Eine interaktive Installation, die philosophische Weisheit über das Erkennen und Behandeln von Mikroaggressionen und subtilen Vektoren der Andersartigkeit im Alltag generiert.",
  "Italian": "Un'installazione interattiva che genera saggezza filosofica sul riconoscimento e l'affrontare microaggressioni e vettori sottili di alterità nella vita quotidiana.",
  "Portuguese": "Uma instalação interativa que gera sabedoria filosófica sobre reconhecer e abordar microagressões e vetores sutis de alteridade na vida cotidiana.",
  "Russian": "Интерактивная инсталляция, генерирующая философскую мудрость о распознавании и преодолении микроагрессий и тонких векторов инаковости в повседневной жизни.",
  "Chinese": "一个互动装置，生成关于识别和应对日常生活中微侵犯和他者性微妙向量的哲学智慧。",
  "Japanese": "日常生活におけるマイクロアグレッションや他者性の微細なベクトルを認識し対処することについての哲学的知恵を生成するインタラクティブ・インスタレーション。",
  "Korean": "일상생활에서 미세공격과 타자성의 미묘한 벡터를 인식하고 대처하는 것에 대한 철학적 지혜를 생성하는 인터랙티브 설치작품.",
  "Arabic": "تجهيز تفاعلي ينتج حكمة فلسفية حول التعرف على العدوان الصغير والمتجهات الخفية للآخرية في الحياة اليومية ومعالجتها.",
  "Hindi": "एक इंटरैक्टिव स्थापना जो दैनिक जीवन में सूक्ष्म आक्रामकता और अन्यता के सूक्ष्म वैक्टर को पहचानने और संबोधित करने के बारे में दार्शनिक ज्ञान उत्पन्न करती है।",
  "Swahili": "Uongozaji wa maingiliano unaozalisha hekima ya kifalsafa kuhusu kutambua na kushughulikia uvamizi mdogo na mielekeo finyu ya utofauti katika maisha ya kila siku."
};

// Complete interface translations for all 70+ languages
const translations = {
  "English": { title: "Subtle Vectors of Otherness", instruction: "Press SPACEBAR to generate wisdom" },
  "Spanish": { title: "Vectores Sutiles de Otredad", instruction: "Presiona BARRA ESPACIADORA para generar sabiduría" },
  "French": { title: "Vecteurs Subtils d'Altérité", instruction: "Appuyez sur ESPACE pour générer la sagesse" },
  "German": { title: "Subtile Vektoren der Andersheit", instruction: "Drücken Sie LEERTASTE um Weisheit zu generieren" },
  "Italian": { title: "Vettori Sottili di Alterità", instruction: "Premere BARRA SPAZIATRICE per generare saggezza" },
  "Portuguese": { title: "Vetores Sutis de Alteridade", instruction: "Pressione BARRA DE ESPAÇO para gerar sabedoria" },
  "Russian": { title: "Тонкие Векторы Инаковости", instruction: "Нажмите ПРОБЕЛ для генерации мудрости" },
  "Chinese": { title: "他者性的微妙向量", instruction: "按空格键生成智慧" },
  "Japanese": { title: "他者性の微細なベクトル", instruction: "スペースキーを押して知恵を生成" },
  "Korean": { title: "타자성의 미묘한 벡터", instruction: "스페이스바를 눌러 지혜 생성" },
  "Arabic": { title: "متجهات خفية للآخرية", instruction: "اضغط مفتاح المسافة لإنتاج الحكمة" },
  "Hebrew": { title: "וקטורים עדינים של זרות", instruction: "לחץ רווח כדי ליצור חכמה" },
  "Dutch": { title: "Subtiele Vectoren van Anderheid", instruction: "Druk op SPATIEBALK om wijsheid te genereren" },
  "Swedish": { title: "Subtila Vektorer av Annorlundahet", instruction: "Tryck MELLANSLAG för att generera visdom" },
  "Norwegian": { title: "Subtile Vektorer av Annerledeshet", instruction: "Trykk MELLOMROM for å generere visdom" },
  "Danish": { title: "Subtile Vektorer af Anderledeshed", instruction: "Tryk MELLEMRUM for at generere visdom" },
  "Finnish": { title: "Erilaisuuden Hienovaraiset Vektorit", instruction: "Paina VÄLILYÖNTI luodaksesi viisautta" },
  "Polish": { title: "Subtelne Wektory Inności", instruction: "Naciśnij SPACJĘ aby wygenerować mądrość" },
  "Czech": { title: "Jemné Vektory Jinakosti", instruction: "Stiskněte MEZERNÍK pro generování moudrosti" },
  "Hungarian": { title: "A Másság Finom Vektorai", instruction: "Nyomja meg a SZÓKÖZ gombot bölcsesség létrehozásához" },
  "Romanian": { title: "Vectori Subtili ai Alterității", instruction: "Apăsați SPAȚIU pentru a genera înțelepciune" },
  "Greek": { title: "Λεπτομερή Διανύσματα Ετερότητας", instruction: "Πατήστε SPACEBAR για να δημιουργήσετε σοφία" },
  "Turkish": { title: "Ötekilik'in İnce Vektörleri", instruction: "Bilgelik oluşturmak için BOŞLUK tuşuna basın" },
  "Hindi": { title: "अन्यता के सूक्ष्म सदिश", instruction: "ज्ञान उत्पन्न करने के लिए स्पेसबार दबाएं" },
  "Bengali": { title: "অন্যত্বের সূক্ষ্ম ভেক্টর", instruction: "জ্ঞান উৎপাদনের জন্য স্পেসবার চাপুন" },
  "Urdu": { title: "دوسرے پن کے باریک ویکٹرز", instruction: "حکمت بنانے کے لیے SPACEBAR دبائیں" },
  "Persian": { title: "بردارهای ظریف دیگری", instruction: "برای تولید بردار SPACEBAR را فشار دهید" },
  "Thai": { title: "เวกเตอร์ที่ละเอียดอ่อนของความเป็นอื่น", instruction: "กด SPACEBAR เพื่อสร้างเวกเตอร์" },
  "Vietnamese": { title: "Những Vector Tinh Tế của Sự Khác Biệt", instruction: "Nhấn SPACEBAR để tạo vector" },
  "Indonesian": { title: "Vektor Halus Keterasingan", instruction: "Tekan SPACEBAR untuk membuat vektor" },
  "Swahili": { title: "Mielekeo Finyu ya Utofauti", instruction: "Bonyeza SPACEBAR ili kuzalisha hekima" },
  "Yoruba": { title: "Awọn Fẹkito Tinrin ti Miiran", instruction: "Tẹ SPACEBAR lati ṣe awọn fẹkito" },
  "Igbo": { title: "Vector Nke Ọzọ", instruction: "Pịa SPACEBAR iji mepụta vector" },
  "Hausa": { title: "Vectors Masu Dauke da Bambanci", instruction: "Danna SPACEBAR don samar da vectors" },
  "Amharic": { title: "የሌላነት ስውር ቬክተሮች", instruction: "ቬክተሮችን ለመፍጠር SPACEBAR ተጫን" },
  "Zulu": { title: "Ama-vector Afihliwe Obuye", instruction: "Cindezela i-SPACEBAR ukuze udale ama-vector" },
  "Afrikaans": { title: "Subtiele Vektore van Andersheid", instruction: "Druk SPASIE om vektore te genereer" },
  "Tamil": { title: "பிறத்தன்மையின் நுட்பமான திசையன்கள்", instruction: "வெக்டர்களை உருவாக்க SPACEBAR அழுத்தவும்" },
  "Telugu": { title: "అన్యత్వపు సూక్ష్మ వెక్టర్లు", instruction: "వెక్టర్లను రూపొందించడానికి SPACEBAR నొక్కండి" },
  "Marathi": { title: "परत्वाचे सूक्ष्म सदिश", instruction: "व्हेक्टर तयार करण्यासाठी SPACEBAR दाबा" },
  "Gujarati": { title: "અન્યત્વના સૂક્ષ્મ વેક્ટર્સ", instruction: "વેક્ટર બનાવવા માટે SPACEBAR દબાવો" },
  "Punjabi": { title: "ਦੂਸਰੇਪਣ ਦੇ ਸੂਖਮ ਵੈਕਟਰ", instruction: "ਵੈਕਟਰ ਬਣਾਉਣ ਲਈ SPACEBAR ਦਬਾਓ" },
  "Malayalam": { title: "അന്യത്വത്തിന്റെ സൂക്ഷ്മ വെക്ടറുകൾ", instruction: "വെക്ടറുകൾ സൃഷ്ടിക്കാൻ SPACEBAR അമർത്തുക" },
  "Kannada": { title: "ಅನ್ಯತ್ವದ ಸೂಕ್ಷ್ಮ ವೆಕ್ಟರ್‌ಗಳು", instruction: "ವೆಕ್ಟರ್‌ಗಳನ್ನು ರಚಿಸಲು SPACEBAR ಒತ್ತಿರಿ" },
  "Ukrainian": { title: "Тонкі Вектори Інакшості", instruction: "Натисніть ПРОБІЛ для генерації векторів" },
  "Bulgarian": { title: "Фини Вектори на Инакостта", instruction: "Натиснете SPACEBAR за генериране на вектори" },
  "Serbian": { title: "Сuptilni Вектори Другости", instruction: "Притисните SPACEBAR да генеришете векторе" },
  "Croatian": { title: "Suptilni Vektori Drugosti", instruction: "Pritisnite SPACEBAR za generiranje vektora" },
  "Bosnian": { title: "Suptilni Vektori Drugosti", instruction: "Pritisnite SPACEBAR za generiranje vektora" },
  "Slovenian": { title: "Subtilni Vektorji Drugačnosti", instruction: "Pritisnite SPACEBAR za generiranje vektorjev" },
  "Slovak": { title: "Jemné Vektory Inakosti", instruction: "Stlačte MEDZERNÍK pre generovanie vektorov" },
  "Lithuanian": { title: "Kitoniškumo Subtilūs Vektoriai", instruction: "Spauskite TARPĄ vektorių generavimui" },
  "Latvian": { title: "Citādības Smalkie Vektori", instruction: "Nospiediet ATSTARPI vektoru ģenerēšanai" },
  "Estonian": { title: "Teistsugususe Peened Vektorid", instruction: "Vajutage TÜHIKUT vektorite genereerimiseks" },
  "Albanian": { title: "Vektorët e Hollë të Tjetërsisë", instruction: "Shtypni HAPËSIRË për të gjeneruar vektorë" },
  "Macedonian": { title: "Суптилни Вектори на Различноста", instruction: "Притиснете SPACEBAR за генерирање вектори" },
  "Mongolian": { title: "Өөр байдлын нарийн векторууд", instruction: "Вектор үүсгэхийн тулд SPACEBAR дарна уу" },
  "Kazakh": { title: "Басқалықтың Нәзік Векторлары", instruction: "Векторларды жасау үшін SPACEBAR басыңыз" },
  "Uzbek": { title: "Boshqalik Nozik Vektorlari", instruction: "Vektorlar yaratish uchun SPACEBAR bosing" },
  "Tajik": { title: "Вектороти Нозуки Дигарӣ", instruction: "Барои офаридани векторҳо SPACEBAR-ро пахш кунед" },
  "Kyrgyz": { title: "Башкачылыктын Нечке Векторлору", instruction: "Векторлорду түзүү үчүн SPACEBAR басыңыз" },
  "Armenian": { title: "Այլությունների Նուրբ Վեկտորները", instruction: "Վեկտորներ ստեղծելու համար սեղմեք SPACEBAR" },
  "Georgian": { title: "სხვაობის ნაზი ვექტორები", instruction: "ვექტორების შესაქმნელად დააჭირეთ SPACEBAR-ს" },
  "Azerbaijani": { title: "Başqalığın İncə Vektorları", instruction: "Vektorlar yaratmaq üçün SPACEBAR basın" },
  "Malay": { title: "Vektor Halus Keterasingan", instruction: "Tekan SPACEBAR untuk menjana vektor" },
  "Filipino": { title: "Mga Pinong Vector ng Kaibahan", instruction: "Pindutin ang SPACEBAR upang makagawa ng mga vector" },
  "Burmese": { title: "ကွဲပြားမှု၏ နုံ့ဆမ်းသော ဗက်တာများ", instruction: "ဗက်တာများဖန်တီးရန် SPACEBAR ကို နှိပ်ပါ" },
  "Khmer": { title: "វ៉ិចទ័រដ៏ស៊ីវិល័យនៃភាពខុសគ្នា", instruction: "ចុច SPACEBAR ដើម្បីបង្កើតវ៉ិចទ័រ" },
  "Lao": { title: "ເວັກເຕີທີ່ລະອຽດອ່ອນຂອງຄວາມແຕກຕ່າງ", instruction: "ກົດ SPACEBAR ເພື່ອສ້າງເວັກເຕີ" },
  "Nepali": { title: "अन्यताका सूक्ष्म भेक्टरहरू", instruction: "भेक्टरहरू उत्पादन गर्न SPACEBAR थिच्नुहोस्" },
  "Sinhala": { title: "අන්යභාවයේ සියුම් දෛශික", instruction: "දෛශික නිර්මාණය කිරීමට SPACEBAR එබන්න" },
  "Icelandic": { title: "Fágaðir Vigrar Óskyldleika", instruction: "Ýttu á BILSTÖNG til að búa til vigra" },
  "Irish": { title: "Veicteoirí Caolchúiseacha na hEachtraíochta", instruction: "Brúigh SPÁS chun veicteoirí a ghiniúint" },
  "Welsh": { title: "Fectorau Cynnil Gwahaniaeth", instruction: "Gwasgwch GOFOD i gynhyrchu fectorau" },
  "Scottish Gaelic": { title: "Vectoran Caola na h-Eile", instruction: "Brùth SPACEBAR gus vectoran a chruthachadh" },
  "Basque": { title: "Bestearen Bektore Fineak", instruction: "Sakatu ZURIUNEA bektoreak sortzeko" },
  "Catalan": { title: "Vectors Subtils d'Alteritat", instruction: "Premeu ESPAI per generar vectors" },
  "Galician": { title: "Vectores Sutís da Alteridade", instruction: "Preme ESPAZO para xerar vectores" },
  "Esperanto": { title: "Subtilaj Vektoroj de Alieco", instruction: "Premu SPACEBAR por krei vektorojn" },
  "Latin": { title: "Vectores Subtiles Alteritatis", instruction: "Preme SPATIUM ad vectores generandos" },
  "Sanskrit": { title: "अन्यत्वस्य सूक्ष्म सदिशाः", instruction: "सदिशान् उत्पादयितुं SPACEBAR नुदन्तु" },
  "Pashto": { title: "د بلتون ښکلي ویکټورونه", instruction: "د ویکټورونو جوړولو لپاره SPACEBAR فشار ورکړئ" },
  "Dari": { title: "وکتورهای ظریف دیگری", instruction: "برای ایجاد وکتورها SPACEBAR را فشار دهید" },
  "Kurdish": { title: "Vektorên Zirav ên Cudahiyê", instruction: "Ji bo çêkirina vektoran SPACEBAR bikişîne" },
  "Tibetan": { title: "གཞན་དབང་གི་ཕྲ་མོའི་ཁ་ཕྱོགས།", instruction: "ཁ་ཕྱོགས་བཟོ་བའི་ཆེད་དུ་ SPACEBAR མནན་རོགས།" }
};

// Memory system to prevent repetition and build contextual awareness
let usedReasoningTopics = new Set(); // Store hash of used reasoning topics
let usedMicroaggressionTypes = new Set(); // Store used microaggression categories
let generationHistory = []; // Store full generation context
let contextualMemory = []; // Store themes and patterns from previous generations

// LANGUAGE-SPECIFIC FONT SUPPORT
function getFontForLanguage(language, fontType = 'serif') {
  const fontFamilies = {
    'Chinese': {
      serif: '"Noto Serif CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, serif',
      sansSerif: '"Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimHei, sans-serif'
    },
    'Japanese': {
      serif: '"Noto Serif CJK JP", "Hiragino Mincho Pro", "Yu Mincho", "MS Mincho", serif',
      sansSerif: '"Noto Sans CJK JP", "Hiragino Kaku Gothic Pro", "Yu Gothic", "MS Gothic", sans-serif'
    },
    'Korean': {
      serif: '"Noto Serif CJK KR", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", serif',
      sansSerif: '"Noto Sans CJK KR", "Apple SD Gothic Neo", "Malgun Gothic", "맑은 고딕", sans-serif'
    },
    'Arabic': {
      serif: '"Noto Serif Arabic", "Times New Roman", "Traditional Arabic", serif',
      sansSerif: '"Noto Sans Arabic", "Segoe UI", "Tahoma", "Arabic Typesetting", sans-serif'
    },
    'Hebrew': {
      serif: '"Noto Serif Hebrew", "Times New Roman", "David", serif',
      sansSerif: '"Noto Sans Hebrew", "Segoe UI", "Tahoma", "Arial Unicode MS", sans-serif'
    },
    'Thai': {
      serif: '"Noto Serif Thai", "Thonburi", "Krungthep", serif',
      sansSerif: '"Noto Sans Thai", "Thonburi", "Krungthep", sans-serif'
    },
    'Hindi': {
      serif: '"Noto Serif Devanagari", "Mangal", "Kokila", serif',
      sansSerif: '"Noto Sans Devanagari", "Mangal", "Segoe UI", sans-serif'
    },
    'Bengali': {
      serif: '"Noto Serif Bengali", "Vrinda", "Shonar Bangla", serif',
      sansSerif: '"Noto Sans Bengali", "Vrinda", "Segoe UI", sans-serif'
    },
    'Russian': {
      serif: 'Georgia, "Times New Roman", "Liberation Serif", serif',
      sansSerif: '"Helvetica Neue", Arial, "Liberation Sans", sans-serif'
    },
    'Yoruba': {
      serif: '"Noto Serif", "Times New Roman", "DejaVu Serif", serif',
      sansSerif: '"Noto Sans", "Arial Unicode MS", "DejaVu Sans", "Segoe UI", sans-serif'
    },
    'Igbo': {
      serif: '"Noto Serif", "Times New Roman", "DejaVu Serif", serif',
      sansSerif: '"Noto Sans", "Arial Unicode MS", "DejaVu Sans", "Segoe UI", sans-serif'
    },
    'Hausa': {
      serif: '"Noto Serif", "Times New Roman", "DejaVu Serif", serif',
      sansSerif: '"Noto Sans", "Arial Unicode MS", "DejaVu Sans", "Segoe UI", sans-serif'
    },
    'Swahili': {
      serif: '"Noto Serif", "Times New Roman", "DejaVu Serif", serif',
      sansSerif: '"Noto Sans", "Arial Unicode MS", "DejaVu Sans", "Segoe UI", sans-serif'
    },
    'Amharic': {
      serif: '"Noto Serif Ethiopic", "Nyala", "Ethiopia Jiret", serif',
      sansSerif: '"Noto Sans Ethiopic", "Nyala", "Ethiopia Jiret", "Arial Unicode MS", sans-serif'
    },
    'Zulu': {
      serif: '"Noto Serif", "Times New Roman", "DejaVu Serif", serif',
      sansSerif: '"Noto Sans", "Arial Unicode MS", "DejaVu Sans", "Segoe UI", sans-serif'
    }
  };
  
  if (fontFamilies[language]) {
    return fontFamilies[language][fontType] || fontFamilies[language].sansSerif;
  }
  
  // Default fallback fonts
  return fontType === 'serif' ? 
    'Georgia, "Times New Roman", serif' : 
    '"Helvetica Neue", Arial, sans-serif';
}

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

// Check if reasoning topic was already used
function isAlreadyUsed(reasoningContent, microaggressionType) {
  let contentHash = hashString(reasoningContent.toLowerCase().trim());
  let typeKey = microaggressionType.toLowerCase().trim();
  
  return usedReasoningTopics.has(contentHash) || usedMicroaggressionTypes.has(typeKey);
}

// Extract themes from philosophical reasoning content
function extractContextualThemes(content) {
  // Extract key themes and patterns from the reasoning for building memory
  const themes = {
    microaggression_type: null,
    context: null,
    oppression_form: null,
    response_approach: null
  };
  
  // Simple keyword detection for thematic patterns
  const text = content.toLowerCase();
  
  // Detect microaggression types
  if (text.includes('where are you from') || text.includes('racial') || text.includes('ethnicity') || text.includes('accent')) {
    themes.microaggression_type = 'racial';
  } else if (text.includes('gender') || text.includes('women') || text.includes('interrupt') || text.includes('mansplain')) {
    themes.microaggression_type = 'gender';
  } else if (text.includes('sexuality') || text.includes('heteronormative') || text.includes('gay') || text.includes('lgbtq')) {
    themes.microaggression_type = 'sexuality';
  } else if (text.includes('class') || text.includes('economic') || text.includes('poor') || text.includes('wealth')) {
    themes.microaggression_type = 'class';
  } else if (text.includes('disability') || text.includes('ableist') || text.includes('inspiration') || text.includes('accessibility')) {
    themes.microaggression_type = 'disability';
  } else if (text.includes('age') || text.includes('boomer') || text.includes('millennial') || text.includes('generation')) {
    themes.microaggression_type = 'age';
  } else if (text.includes('religion') || text.includes('spiritual') || text.includes('holiday') || text.includes('belief')) {
    themes.microaggression_type = 'religious';
  } else if (text.includes('body') || text.includes('weight') || text.includes('size') || text.includes('health')) {
    themes.microaggression_type = 'body';
  } else if (text.includes('neurodiversity') || text.includes('autism') || text.includes('adhd') || text.includes('mental')) {
    themes.microaggression_type = 'neurodiversity';
  } else {
    themes.microaggression_type = 'intersectional';
  }
  
  // Detect context
  if (text.includes('workplace') || text.includes('office') || text.includes('professional')) {
    themes.context = 'workplace';
  } else if (text.includes('school') || text.includes('education') || text.includes('academic')) {
    themes.context = 'educational';
  } else if (text.includes('healthcare') || text.includes('medical') || text.includes('doctor')) {
    themes.context = 'healthcare';
  } else if (text.includes('social') || text.includes('friend') || text.includes('family')) {
    themes.context = 'social';
  } else if (text.includes('digital') || text.includes('online') || text.includes('internet')) {
    themes.context = 'digital';
  } else {
    themes.context = 'general';
  }
  
  // Detect response approach
  if (text.includes('recognize') || text.includes('identify') || text.includes('notice')) {
    themes.response_approach = 'recognition';
  } else if (text.includes('respond') || text.includes('address') || text.includes('confront')) {
    themes.response_approach = 'intervention';
  } else if (text.includes('support') || text.includes('ally') || text.includes('solidarity')) {
    themes.response_approach = 'allyship';
  } else if (text.includes('reflect') || text.includes('examine') || text.includes('understand')) {
    themes.response_approach = 'self-reflection';
  } else {
    themes.response_approach = 'awareness';
  }
  
  return themes;
}

function addToMemory(reasoningContent, microaggressionType) {
  let contentHash = hashString(reasoningContent.toLowerCase().trim());
  let typeKey = microaggressionType.toLowerCase().trim();
  
  usedReasoningTopics.add(contentHash);
  usedMicroaggressionTypes.add(typeKey);
  
  // Extract themes for contextual memory
  const themes = extractContextualThemes(reasoningContent);
  contextualMemory.push(themes);
  
  // Keep only last 5 contextual memories to build upon
  if (contextualMemory.length > 5) {
    contextualMemory.shift();
  }
  
  generationHistory.push({
    reasoning: reasoningContent.substring(0, 100) + "...", // Store first 100 chars for reference
    type: typeKey,
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
  
  // Button text with proper font for the language
  p.fill(p.color(50));
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(12);
  p.textFont(getFontForLanguage(selectedLanguage, 'sansSerif'));
  p.noStroke();
  console.log(`Displaying button text: "${selectedLanguage}"`);
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
      
      // Text with proper font for each language
      p.fill(selectedLanguage === lang ? p.color(0, 100, 200) : p.color(50));
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(10);
      p.textFont(getFontForLanguage(lang, 'sansSerif'));
      if (lang === 'Arabic' || lang === 'Korean') {
        console.log(`Rendering menu item: "${lang}" at index ${langIndex}`);
      }
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
        let newLanguage = availableLanguages[langIndex];
        console.log(`Language selection: Index ${langIndex}, Language: ${newLanguage}`);
        console.log(`Previous language: ${selectedLanguage}, New language: ${newLanguage}`);
        
        selectedLanguage = newLanguage;
        showLanguageMenu = false;
        languageScrollOffset = 0; // Reset scroll when language is selected
        
        // Always return to homepage when language changes
        isLoading = true;
        textToShow = ""; // Clear any existing content
        targetSpeed = 0.3; // Slow animation for landing page
        console.log(`Language changed to ${newLanguage} - returning to homepage`);
        
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

// Advanced liquid p5.js layout system for philosophical reasoning - responsive, adaptive, and beautiful
function renderPhilosophicalLayout(p, reasoning, reflection) {
  p.push();
  
  // LIQUID RESPONSIVE CALCULATIONS
  // Adaptive margins based on screen size and orientation
  let isPortrait = p.height > p.width;
  let isMobile = p.width < 768;
  let isTablet = p.width >= 768 && p.width < 1024;
  let isDesktop = p.width >= 1024;
  
  // Dynamic margin calculation - minimal margins for maximum reading space
  let marginPercent;
  if (isMobile) {
    marginPercent = 0.01; // Tiny margins on mobile
  } else if (isTablet) {
    marginPercent = 0.015;
  } else {
    marginPercent = 0.02; // Minimal desktop margins
  }
  
  let margin = Math.max(p.width * marginPercent, 5); // Min 5px margin
  let contentWidth = p.width - (margin * 2);
  let availableHeight = p.height * 0.85; // Use 85% of screen height (reserve space for interface)
  
  // LIQUID TYPOGRAPHY SYSTEM
  // Base font sizes that scale beautifully with screen size
  let baseReasoningSize, baseReflectionSize;
  
  if (isMobile) {
    baseReasoningSize = Math.max(32, Math.min(48, p.width * 0.09)); // 9% of width (much larger)
    baseReflectionSize = Math.max(28, Math.min(42, p.width * 0.08)); // 8% of width (much larger)  
  } else if (isTablet) {
    baseReasoningSize = Math.max(38, Math.min(56, p.width * 0.07)); // 7% of width (much larger)
    baseReflectionSize = Math.max(34, Math.min(48, p.width * 0.06)); // 6% of width (much larger)
  } else {
    baseReasoningSize = Math.max(42, Math.min(64, p.width * 0.06)); // 6% of width (much larger)
    baseReflectionSize = Math.max(36, Math.min(54, p.width * 0.05)); // 5% of width (much larger)
  }
  
  // ADAPTIVE CONTENT WIDTH SYSTEM
  // Use 95% of the window width for maximum reading space
  let reasoningWidth = p.width * 0.95; // 95% of window width - nearly full screen
  let reflectionWidth = p.width * 0.95; // 95% of window width - nearly full screen
  
  // INTELLIGENT TEXT WRAPPING with multi-language support
  function liquidWrapText(text, maxWidth, fontSize, fontFamily) {
    p.textSize(fontSize);
    p.textFont(fontFamily);
    
    // Handle different scripts
    let isAsian = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]/.test(text);
    let isRTL = /[\u0590-\u05ff\u0600-\u06ff\u0750-\u077f]/.test(text);
    
    // Ultra-safe width (account for character variations)
    let safeWidth = maxWidth * 0.92;
    
    if (isAsian) {
      // For CJK: allow breaking at any character
      return wrapAsianText(text, safeWidth);
    } else {
      // For Latin/RTL: word-based wrapping with character fallback
      return wrapLatinText(text, safeWidth);
    }
  }
  
  function wrapAsianText(text, maxWidth) {
    let lines = [];
    let currentLine = '';
    
    for (let char of text) {
      let testLine = currentLine + char;
      if (p.textWidth(testLine) > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  function wrapLatinText(text, maxWidth) {
    let words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
      let testLine = currentLine + (currentLine ? ' ' : '') + word;
      
      if (p.textWidth(testLine) > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          // Check if single word is too long
          if (p.textWidth(word) > maxWidth) {
            // Break long word character by character
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
        } else {
          currentLine = word;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  // CONTENT ANALYSIS & ADAPTIVE SIZING WITH LANGUAGE-SPECIFIC FONTS
  let reasoningFont = getFontForLanguage(selectedLanguage, 'serif');
  let reflectionFont = getFontForLanguage(selectedLanguage, 'sansSerif');
  
  let reasoningLines = liquidWrapText(reasoning, reasoningWidth, baseReasoningSize, reasoningFont);
  let reflectionLines = liquidWrapText(reflection, reflectionWidth, baseReflectionSize, reflectionFont);
  
  // ADAPTIVE LINE HEIGHTS for optimal readability
  let reasoningLineHeight = baseReasoningSize * 1.4;
  let reflectionLineHeight = baseReflectionSize * 1.3;
  
  // INTELLIGENT SPACING SYSTEM
  let sectionSpacing = Math.max(25, baseReasoningSize * 1.8); // More space between sections
  
  // Calculate total content height
  let totalHeight = 
    (reasoningLines.length * reasoningLineHeight) + 
    sectionSpacing + 
    (reflectionLines.length * reflectionLineHeight);
  
  // CONSISTENT LAYOUT - maintain stable font sizes across generations
  let scaleFactor = 1;
  let attempts = 0;
  let maxAttempts = 3; // Fewer attempts to maintain consistency
  
  // Only scale if content is significantly too large (more than 20% overflow)
  if (totalHeight > availableHeight * 1.2) {
    while (totalHeight > availableHeight && attempts < maxAttempts) {
      attempts++;
      
      if (attempts === 1) {
        // First attempt: gentle scaling only
        scaleFactor = Math.max(0.9, availableHeight / totalHeight * 0.95);
      } else if (attempts === 2) {
        // Second attempt: moderate scaling
        scaleFactor = Math.max(0.85, availableHeight / totalHeight * 0.90);
      } else {
        // Final attempt: ensure fit but maintain readability
        scaleFactor = Math.max(0.8, availableHeight / totalHeight * 0.85);
      }
      
      // Re-calculate with consistent scaling - maintain font size stability
      let scaledReasoningSize = Math.max(32, baseReasoningSize * scaleFactor); // Never go below 32px
      let scaledReflectionSize = Math.max(28, baseReflectionSize * scaleFactor); // Never go below 28px  
      
      reasoningLines = liquidWrapText(reasoning, reasoningWidth, scaledReasoningSize, reasoningFont);
      reflectionLines = liquidWrapText(reflection, reflectionWidth, scaledReflectionSize, reflectionFont);
      
      // Maintain consistent line heights
      reasoningLineHeight = scaledReasoningSize * 1.3;
      reflectionLineHeight = scaledReflectionSize * 1.2;
      
      sectionSpacing = Math.max(20, sectionSpacing * scaleFactor);
      
      totalHeight = 
        (reasoningLines.length * reasoningLineHeight) + 
        sectionSpacing + 
        (reflectionLines.length * reflectionLineHeight);
    }
  }
  
  // SCROLLING FROM BOTTOM UP
  // Start text at bottom of screen and scroll upward
  let startY = p.height + scrollOffset;
  let currentY = startY;
  
  // Update scroll position for animation
  if (isScrolling) {
    scrollOffset -= scrollSpeed;
    // Reset when text has scrolled completely off screen
    if (scrollOffset < -(totalHeight + p.height)) {
      scrollOffset = 0;
    }
  }
  
  // RENDER REASONING with enhanced typography
  p.textAlign(p.CENTER, p.TOP);
  p.textFont(reasoningFont);
  p.textSize(baseReasoningSize * scaleFactor);
  p.fill(20); // Rich black
  
  for (let line of reasoningLines) {
    p.text(line, p.width / 2, currentY);
    currentY += reasoningLineHeight;
  }
  
  currentY += sectionSpacing;
  
  // RENDER REFLECTION with elegant styling
  p.textFont(reflectionFont);
  p.textSize(baseReflectionSize * scaleFactor);
  p.fill(85); // Sophisticated gray
  p.textStyle(p.ITALIC);
  
  for (let line of reflectionLines) {
    p.text(line, p.width / 2, currentY);
    currentY += reflectionLineHeight;
  }
  p.textStyle(p.NORMAL);
  
  // SUBTLE INTERFACE ELEMENTS
  drawSubtleInterface(p);
  
  p.pop();
}

// Advanced liquid p5.js layout system - responsive, adaptive, and beautiful
function renderProfessionalLayout(p, quote, author, context) {
  p.push();
  
  // LIQUID RESPONSIVE CALCULATIONS
  // Adaptive margins based on screen size and orientation
  let isPortrait = p.height > p.width;
  let isMobile = p.width < 768;
  let isTablet = p.width >= 768 && p.width < 1024;
  let isDesktop = p.width >= 1024;
  
  // Dynamic margin calculation
  let marginPercent;
  if (isMobile) {
    marginPercent = isPortrait ? 0.08 : 0.12; // Tighter margins on mobile
  } else if (isTablet) {
    marginPercent = 0.12;
  } else {
    marginPercent = 0.15; // Desktop
  }
  
  let margin = Math.max(p.width * marginPercent, 20); // Min 20px margin
  let contentWidth = p.width - (margin * 2);
  let availableHeight = p.height * 0.85; // Use 85% of screen height (reserve space for interface)
  
  // LIQUID TYPOGRAPHY SYSTEM
  // Base font sizes that scale beautifully with screen size
  let baseQuoteSize, baseAuthorSize, baseContextSize;
  
  if (isMobile) {
    baseQuoteSize = Math.max(32, Math.min(48, p.width * 0.09)); // 9% of width (much larger)
    baseAuthorSize = Math.max(26, Math.min(38, p.width * 0.07)); // 7% of width (much larger)  
    baseContextSize = Math.max(22, Math.min(34, p.width * 0.06)); // 6% of width (much larger)
  } else if (isTablet) {
    baseQuoteSize = Math.max(38, Math.min(56, p.width * 0.07)); // 7% of width (much larger)
    baseAuthorSize = Math.max(30, Math.min(42, p.width * 0.055)); // 5.5% of width (much larger)
    baseContextSize = Math.max(26, Math.min(38, p.width * 0.048)); // 4.8% of width (much larger)
  } else {
    baseQuoteSize = Math.max(42, Math.min(64, p.width * 0.06)); // 6% of width (much larger)
    baseAuthorSize = Math.max(34, Math.min(48, p.width * 0.045)); // 4.5% of width (much larger)
    baseContextSize = Math.max(30, Math.min(42, p.width * 0.04)); // 4% of width (much larger)
  }
  
  // ADAPTIVE CONTENT WIDTH SYSTEM
  // Quote gets more space, context gets conservative width for readability
  let quoteWidth = contentWidth * (isMobile ? 0.95 : 0.85); // Wider on mobile for readability
  let authorWidth = contentWidth * 0.9;
  let contextWidth = contentWidth * (isMobile ? 0.88 : 0.75); // Conservative for long explanations
  
  // INTELLIGENT TEXT WRAPPING with multi-language support
  function liquidWrapText(text, maxWidth, fontSize, fontFamily) {
    p.textSize(fontSize);
    p.textFont(fontFamily);
    
    // Handle different scripts
    let isAsian = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\uac00-\ud7af]/.test(text);
    let isRTL = /[\u0590-\u05ff\u0600-\u06ff\u0750-\u077f]/.test(text);
    
    // Ultra-safe width (account for character variations)
    let safeWidth = maxWidth * 0.92;
    
    if (isAsian) {
      // For CJK: allow breaking at any character
      return wrapAsianText(text, safeWidth);
    } else {
      // For Latin/RTL: word-based wrapping with character fallback
      return wrapLatinText(text, safeWidth);
    }
  }
  
  function wrapAsianText(text, maxWidth) {
let lines = [];
    let currentLine = '';
    
    for (let char of text) {
      let testLine = currentLine + char;
      if (p.textWidth(testLine) > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  function wrapLatinText(text, maxWidth) {
    let words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
      let testLine = currentLine + (currentLine ? ' ' : '') + word;
      
      if (p.textWidth(testLine) > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          // Check if single word is too long
          if (p.textWidth(word) > maxWidth) {
            // Break long word character by character
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
        } else {
          currentLine = word;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  // CONTENT ANALYSIS & ADAPTIVE SIZING WITH LANGUAGE-SPECIFIC FONTS
  let quoteFont = getFontForLanguage(selectedLanguage, 'serif');
  let authorFont = getFontForLanguage(selectedLanguage, 'serif');
  let contextFont = getFontForLanguage(selectedLanguage, 'sansSerif');
  
  let quoteLines = liquidWrapText(quote, quoteWidth, baseQuoteSize, quoteFont);
  let authorLines = liquidWrapText(author, authorWidth, baseAuthorSize, authorFont);
  let contextLines = context ? liquidWrapText(context, contextWidth, baseContextSize, contextFont) : [];
  
  // ADAPTIVE LINE HEIGHTS for optimal readability
  let quoteLineHeight = baseQuoteSize * 1.4;
  let authorLineHeight = baseAuthorSize * 1.3;
  let contextLineHeight = baseContextSize * 1.5;
  
  // INTELLIGENT SPACING SYSTEM
  let sectionSpacing = Math.max(20, baseQuoteSize * 1.5); // Proportional to text size
  let contextSpacing = Math.max(15, baseAuthorSize * 1.2);
  
  // Calculate total content height
  let totalHeight = 
    (quoteLines.length * quoteLineHeight) + 
    sectionSpacing + 
    (authorLines.length * authorLineHeight) + 
    (contextLines.length > 0 ? contextSpacing + (contextLines.length * contextLineHeight) : 0);
  
  // ADAPTIVE LAYOUT - intelligent multi-stage scaling for guaranteed COMPLETE fit
  let scaleFactor = 1;
  let attempts = 0;
  let maxAttempts = 6; // Even more attempts to guarantee ALL text fits
  
  while (totalHeight > availableHeight && attempts < maxAttempts) {
    attempts++;
    
    if (attempts === 1) {
      // First attempt: gentle scaling
      scaleFactor = availableHeight / totalHeight * 0.88;
    } else if (attempts === 2) {
      // Second attempt: reduce context width significantly
      scaleFactor = availableHeight / totalHeight * 0.82;
      contextWidth = contentWidth * (isMobile ? 0.85 : 0.70);
    } else if (attempts === 3) {
      // Third attempt: more aggressive scaling + narrower context
      scaleFactor = availableHeight / totalHeight * 0.75;
      contextWidth = contentWidth * (isMobile ? 0.80 : 0.60);
    } else if (attempts === 4) {
      // Fourth attempt: maximum compression with very narrow context
      scaleFactor = availableHeight / totalHeight * 0.68;
      contextWidth = contentWidth * (isMobile ? 0.75 : 0.50);
      quoteWidth = contentWidth * (isMobile ? 0.88 : 0.75);
    } else if (attempts === 5) {
      // Fifth attempt: extreme compression - ensure ALL content fits
      scaleFactor = availableHeight / totalHeight * 0.55;
      contextWidth = contentWidth * (isMobile ? 0.65 : 0.40);
      quoteWidth = contentWidth * (isMobile ? 0.80 : 0.65);
      authorWidth = contentWidth * 0.75;
    } else {
      // Final attempt: maximum compression to guarantee complete display
      scaleFactor = availableHeight / totalHeight * 0.50;
      contextWidth = contentWidth * (isMobile ? 0.60 : 0.35);
      quoteWidth = contentWidth * (isMobile ? 0.75 : 0.60);
      authorWidth = contentWidth * 0.70;
    }
    
    // Re-calculate everything with scale factor - ensure ALL text remains readable
    let scaledQuoteSize = Math.max(attempts > 4 ? 22 : 26, baseQuoteSize * scaleFactor); // Min 22px for extreme cases (much larger)
    let scaledAuthorSize = Math.max(attempts > 4 ? 18 : 22, baseAuthorSize * scaleFactor); // Min 18px for extreme cases (much larger)  
    let scaledContextSize = Math.max(attempts > 4 ? 16 : 20, baseContextSize * scaleFactor); // Min 16px but still readable (much larger)
    
    quoteLines = liquidWrapText(quote, quoteWidth, scaledQuoteSize, quoteFont);
    authorLines = liquidWrapText(author, authorWidth, scaledAuthorSize, authorFont);
    contextLines = context ? liquidWrapText(context, contextWidth, scaledContextSize, contextFont) : [];
    
    // More aggressive line height compression when needed
    quoteLineHeight = scaledQuoteSize * (attempts > 3 ? 1.25 : 1.3);
    authorLineHeight = scaledAuthorSize * (attempts > 3 ? 1.15 : 1.2);
    contextLineHeight = scaledContextSize * (attempts > 3 ? 1.3 : 1.4);
    
    sectionSpacing = Math.max(8, sectionSpacing * scaleFactor);
    contextSpacing = Math.max(6, contextSpacing * scaleFactor);
    
    totalHeight = 
      (quoteLines.length * quoteLineHeight) + 
      sectionSpacing + 
      (authorLines.length * authorLineHeight) + 
      (contextLines.length > 0 ? contextSpacing + (contextLines.length * contextLineHeight) : 0);
  }
  
  // PERFECT VERTICAL CENTERING
  let startY = (p.height - totalHeight) / 2;
  let currentY = startY;
  
  // RENDER QUOTE with enhanced typography
  p.textAlign(p.CENTER, p.TOP);
  p.textFont(quoteFont);
  p.textSize(baseQuoteSize * scaleFactor);
  p.fill(20); // Rich black
  
  for (let line of quoteLines) {
    p.text(line, p.width / 2, currentY);
    currentY += quoteLineHeight;
  }
  
  currentY += sectionSpacing;
  
  // RENDER AUTHOR with elegant styling
  p.textFont(authorFont);
  p.textSize(baseAuthorSize * scaleFactor);
  p.fill(85); // Sophisticated gray
  p.textStyle(p.ITALIC);
  
  for (let line of authorLines) {
    p.text(line, p.width / 2, currentY);
    currentY += authorLineHeight;
  }
  p.textStyle(p.NORMAL);
  
  // RENDER CONTEXT with maximum readability - prioritize complete display
  if (contextLines.length > 0) {
    currentY += contextSpacing;
    
    p.textFont(contextFont);
    p.textSize(baseContextSize * scaleFactor);
    p.fill(110); // Subtle but readable
    
    // Calculate remaining space more accurately
    let remainingSpace = p.height - currentY - margin;
    let maxLinesInSpace = Math.floor(remainingSpace / contextLineHeight);
    
    // ALWAYS show ALL context lines - no truncation allowed
    // The scaling system above ensures everything fits
    console.log(`Displaying ALL ${contextLines.length} context lines - no truncation`);
    for (let i = 0; i < contextLines.length; i++) {
      p.text(contextLines[i], p.width / 2, currentY);
      currentY += contextLineHeight;
    }
  }
  
  // SUBTLE INTERFACE ELEMENTS
  drawSubtleInterface(p);
  
  p.pop();
}

// Subtle interface for navigation and regeneration
function drawSubtleInterface(p) {
  p.push();
  
  // Get current interface text
  let interfaceText = getCurrentInterfaceText();
  
  // Determine device type for appropriate interface
  let isMobile = p.width < 768;
  let buttonSize = isMobile ? 12 : 14;
  let iconSize = isMobile ? 16 : 20;
  
  // REGENERATE INDICATOR (bottom center)
  let regenY = p.height - (isMobile ? 25 : 35);
  p.fill(120, 120, 120, 60); // Very subtle
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(buttonSize);
  p.textFont('"Helvetica Neue", Arial, sans-serif');
  
  // Get localized navigation text
  let currentTranslation = translations[selectedLanguage] || translations["English"];
  
  // Regenerate instruction (extract key part from main instruction)
  let regenText = currentTranslation.instruction.replace(/Press|Presiona|Appuyez|Drücken|Premere|Pressione|Нажмите|按|スペース|스페이스|اضغط|לחץ|Druk|Tryck|Trykk|Paina|Naciśnij|Stiskněte|Nyomja|Apăsați|Πατήστε|Tekan|Bonyeza|Tẹ|Pịa|Danna|ተጫን|Cindezela|வெக்টர்|నొక్క|दाब|દબાવ|ਦਬਾ|അമർത്ത|ಒತ್ತ|Натисніть|Нажми|Pritisni|Stlačte|Spausk|Nospied|Vajuta|Shtyp|Притисн|дарна|басыңыз|bosing|пахш|басың|սեղմ|დააჭირ|basın|menjana|Pindutin|နှိပ်|ចុច|ກົດ|थिच्|එබන්|Ýttu|Brúigh|Gwasg|Brùth|Sakatu|Preme|Preme/gi, '').trim();
  
  p.text(regenText, p.width / 2, regenY);
  
  // BACK TO LANDING INDICATOR (bottom left)
  let backY = p.height - (isMobile ? 25 : 35);
  let backX = isMobile ? 25 : 35;
  
  p.fill(120, 120, 120, 50); // Even more subtle
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(buttonSize);
  
  // Simple ESC + home text for all languages
  let backText = 'ESC home';
  
  p.text(backText, backX, backY);
  
  // Subtle visual indicators (very minimal)
  // Small dots to indicate interactive areas
  p.fill(120, 120, 120, 30);
  p.noStroke();
  
  // Regenerate indicator dot
  p.circle(p.width / 2 - 80, regenY, 3);
  p.circle(p.width / 2 + 80, regenY, 3);
  
  // Back indicator dot  
  p.circle(backX - 15, backY, 3);
  
  p.pop();
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
    } else if (p.keyCode === 27) { // ESC key - back to landing page
      isLoading = true;
      textToShow = ""; // Clear current text
      continuousMode = false; // Stop continuous generation
      isScrolling = false; // Stop scrolling
      targetSpeed = 0.3; // Slow animation for landing page
    } else if (p.keyCode === 32) { // Spacebar activates/restarts continuous generation
      // Start or restart continuous generation mode
      continuousMode = true;
      isLoading = true;
      
      // Stop scrolling and reset when generating new content
      isScrolling = false;
      scrollOffset = 0;
      
      // Reset the generation timer to start fresh cycle
      lastGenerationTime = Date.now();

      // Accelerate animation when generating new content
      targetSpeed = 4.0; // Fast during generation - dramatic contrast
      
      // Create memory context to avoid repetition and build thematic awareness
      let memoryContext = "";
      
      // Create a randomized list of microaggression types to ensure variety
      const allTypes = ['RACIAL', 'GENDER', 'SEXUALITY', 'CLASS', 'DISABILITY', 'AGE', 'RELIGION', 'NATIONALITY', 'BODY SIZE', 'NEURODIVERSITY', 'EDUCATIONAL'];
      const shuffledTypes = allTypes.sort(() => Math.random() - 0.5);
      
      // Build contextual memory from previous generations
      let thematicContext = '';
      if (contextualMemory.length > 0) {
        const recentThemes = contextualMemory.slice(-3);
        const themesSummary = recentThemes.map(t => `${t.microaggression_type} in ${t.context} context`).join(', ');
        const responseApproaches = recentThemes.map(t => t.response_approach).filter(Boolean);
        
        // Balance different types of microaggressions and response approaches
        let balanceGuidance = '';
        if (responseApproaches.length > 0) {
          const recentRecognition = responseApproaches.filter(s => s === 'recognition').length;
          const recentIntervention = responseApproaches.filter(s => s === 'intervention' || s === 'allyship').length;
          
          if (recentRecognition > recentIntervention) {
            balanceGuidance = ' PRIORITIZE practical intervention strategies and actionable responses to microaggressions.';
          } else if (recentIntervention > recentRecognition) {
            balanceGuidance = ' PRIORITIZE recognition and awareness-building about subtle forms of discrimination.';
          } else {
            balanceGuidance = ' MAINTAIN balance between recognition and response strategies.';
          }
        }
        
        thematicContext = `\n\nCONTEXTUAL MEMORY: Previous reasoning explored: ${themesSummary}. Build upon these themes while exploring new dimensions of microaggressions and subtle discrimination.${balanceGuidance} Connect current examples to broader patterns of how subtle othering operates across different contexts.`;
      }
      
      if (generationHistory.length > 0) {
        let recentTypes = generationHistory.slice(-8).map(h => h.type).join(", ");
        let recentThemes = contextualMemory.slice(-5).map(t => t.microaggression_type).join(", ");
        
        // Find types that haven't been used recently
        const availableTypes = shuffledTypes.filter(type => 
          !recentTypes.toLowerCase().includes(type.toLowerCase()) && 
          !recentThemes.toLowerCase().includes(type.toLowerCase())
        );
        
        const suggestedType = availableTypes.length > 0 ? availableTypes[0] : shuffledTypes[0];
        
        memoryContext = `\n\nCRITICAL: DO NOT repeat microaggression types. Recently covered: ${recentTypes}. Recent themes: ${recentThemes}. You MUST focus on ${suggestedType} microaggressions specifically. Explore this completely different form of subtle discrimination with concrete examples and scenarios.${thematicContext}`;
      } else {
        // For the first generation, randomly pick a starting type
        const randomType = shuffledTypes[0];
        memoryContext = `\n\nSTART with ${randomType} microaggressions. Focus on subtle, everyday forms of this specific type of discrimination that create otherness through seemingly innocent interactions.${thematicContext}`;
      }
      
      chat(`This is "Subtle Vectors of Otherness" - an interactive installation that generates philosophical reasoning about how microaggressions and subtle forms of discrimination create "otherness" in our daily lives. Generate insightful wisdom that helps users recognize and understand these subtle vectors of oppression.

CORE PURPOSE: Create ongoing philosophical reasoning that:
1. ILLUMINATES how seemingly innocent interactions can perpetuate discrimination
2. PROVIDES concrete examples of microaggressions across different contexts
3. OFFERS wisdom for recognizing these patterns in real life
4. SUGGESTS practical approaches for addressing and responding to subtle discrimination

FOCUS AREAS - Generate reasoning about ANY form of subtle othering including:
- RACIAL MICROAGGRESSIONS: "Where are you really from?", assumptions about competence, cultural appropriation
- GENDER MICROAGGRESSIONS: Interrupting women, questioning expertise, appearance comments
- SEXUALITY MICROAGGRESSIONS: Heteronormative assumptions, "that's so gay", visibility erasure
- CLASS MICROAGGRESSIONS: Assumptions about intelligence, "pulling yourself up", cultural capital
- DISABILITY MICROAGGRESSIONS: Inspiration porn, assumptions about capability, accessibility ignorance
- RELIGIOUS MICROAGGRESSIONS: Holiday assumptions, dietary dismissals, spiritual hierarchies
- AGE MICROAGGRESSIONS: "OK boomer", "kids these days", competency assumptions
- NATIONALITY/IMMIGRATION: Accent policing, citizenship questioning, cultural superiority
- BODY SIZE: Health assumptions, food policing, space occupation judgments
- NEURODIVERSITY: "Everyone's a little autistic", attention assumptions, communication norms
- EDUCATIONAL: Academic elitism, "common sense" assumptions, intellectual hierarchies

REASONING STRUCTURE: Generate philosophical insight that includes:
1. RECOGNITION: How to identify the subtle discrimination (exact phrases, behaviors, assumptions)
2. IMPACT: Why this matters - the cumulative psychological and social effects on marginalized people
3. CONCRETE EXAMPLES: Specific real-world scenarios with actual dialogue/situations across different cultures
4. ACTIONABLE RESPONSE: Practical step-by-step guidance on how to address it (as witness, target, or perpetrator)

GLOBAL PERSPECTIVE: Include examples and reasoning relevant to:
- Different cultural contexts and how microaggressions manifest globally
- Intersectional identities and compound discrimination
- Historical context of how these patterns developed
- Contemporary manifestations in digital spaces, workplaces, schools, healthcare, etc.

WISDOM APPROACH: Write as philosophical reasoning that:
- Builds empathy and understanding
- Provides practical tools for recognition
- Offers hope and agency for change
- Connects individual experiences to systemic patterns
- Validates the experiences of those who face discrimination

LANGUAGE REQUIREMENT: You MUST write the entire response in ${selectedLanguage}. This is CRITICAL - the user has selected ${selectedLanguage} and expects ALL content in that language.${memoryContext}

CRITICAL: Use this EXACT format. Keep "Reflection:" in ENGLISH even when the main content is in ${selectedLanguage}.

Format:

[Philosophical reasoning about subtle vectors of otherness - WRITE ENTIRELY IN ${selectedLanguage} - 2-3 paragraphs that illuminate a specific form of microaggression or subtle discrimination. MUST include: (1) Exact examples of phrases/behaviors that constitute this microaggression, (2) Specific scenarios showing how this plays out in real situations, (3) Clear explanation of the psychological impact on targets, (4) Step-by-step guidance on recognition and response strategies]

Reflection: [2-3 sentences ENTIRELY IN ${selectedLanguage} that provide concrete, actionable steps the reader can take immediately - specific phrases to use, behaviors to adopt, or interventions to make when encountering this form of subtle discrimination]

REMEMBER: Everything except the word "Reflection:" must be written in ${selectedLanguage}. Do not use English if the user selected a different language.`);
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
      
      // Start scrolling animation when new content is generated
      isScrolling = true;
      scrollOffset = 0;
      lastGenerationTime = Date.now(); // Update last generation time
      
      // Extract and store reasoning content for memory system
      if (textToShow.includes('Reflection:')) {
        let reflectionSplit = textToShow.split('Reflection:');
        let reasoningContent = reflectionSplit[0].trim();
        
        // Extract microaggression type from the content for memory tracking
        const themes = extractContextualThemes(reasoningContent);
        let microaggressionType = themes.microaggression_type || 'general';
        
        // Check if this exact type was recently used
        if (usedMicroaggressionTypes.has(microaggressionType.toLowerCase())) {
          console.warn(`WARNING: Microaggression type "${microaggressionType}" was recently covered! Memory system should diversify.`);
          // Clear some old entries to allow more variety
          if (usedMicroaggressionTypes.size > 6) {
            usedMicroaggressionTypes.clear();
            console.log("Cleared microaggression types to ensure variety");
          }
        }
        
        // Add to memory to prevent future repetition
        addToMemory(reasoningContent, microaggressionType);
        
        console.log(`Added to memory: "${microaggressionType}" type - Total stored: ${generationHistory.length}`);
        console.log(`Recent types: ${Array.from(usedMicroaggressionTypes).slice(-5).join(', ')}`);
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

    // Auto-generate new content every minute (only when continuous mode is active)
    if (continuousMode && !isLoading && (Date.now() - lastGenerationTime > autoGenerationInterval)) {
      // Trigger automatic generation
      p.keyPressed = function() {}; // Temporarily override to avoid conflicts
      
      // Generate new content automatically
      isLoading = true;
      isScrolling = false;
      scrollOffset = 0;
      targetSpeed = 4.0;
      
      // Create memory context to avoid repetition and build thematic awareness
      let memoryContext = "";
      
      // Create a randomized list of microaggression types to ensure variety
      const allTypes = ['RACIAL', 'GENDER', 'SEXUALITY', 'CLASS', 'DISABILITY', 'AGE', 'RELIGION', 'NATIONALITY', 'BODY SIZE', 'NEURODIVERSITY', 'EDUCATIONAL'];
      const shuffledTypes = allTypes.sort(() => Math.random() - 0.5);
      
      // Build contextual memory from previous generations
      let thematicContext = '';
      if (contextualMemory.length > 0) {
        const recentThemes = contextualMemory.slice(-3);
        const themesSummary = recentThemes.map(t => `${t.microaggression_type} in ${t.context} context`).join(', ');
        const responseApproaches = recentThemes.map(t => t.response_approach).filter(Boolean);
        
        // Balance different types of microaggressions and response approaches
        let balanceGuidance = '';
        if (responseApproaches.length > 0) {
          const recentRecognition = responseApproaches.filter(s => s === 'recognition').length;
          const recentIntervention = responseApproaches.filter(s => s === 'intervention' || s === 'allyship').length;
          
          if (recentRecognition > recentIntervention) {
            balanceGuidance = ' PRIORITIZE practical intervention strategies and actionable responses to microaggressions.';
          } else if (recentIntervention > recentRecognition) {
            balanceGuidance = ' PRIORITIZE recognition and awareness-building about subtle forms of discrimination.';
          } else {
            balanceGuidance = ' MAINTAIN balance between recognition and response strategies.';
          }
        }
        
        thematicContext = `\n\nCONTEXTUAL MEMORY: Previous reasoning explored: ${themesSummary}. Build upon these themes while exploring new dimensions of microaggressions and subtle discrimination.${balanceGuidance} Connect current examples to broader patterns of how subtle othering operates across different contexts.`;
      }
      
      if (generationHistory.length > 0) {
        let recentTypes = generationHistory.slice(-8).map(h => h.type).join(", ");
        let recentThemes = contextualMemory.slice(-5).map(t => t.microaggression_type).join(", ");
        
        // Find types that haven't been used recently
        const availableTypes = shuffledTypes.filter(type => 
          !recentTypes.toLowerCase().includes(type.toLowerCase()) && 
          !recentThemes.toLowerCase().includes(type.toLowerCase())
        );
        
        const suggestedType = availableTypes.length > 0 ? availableTypes[0] : shuffledTypes[0];
        
        memoryContext = `\n\nCRITICAL: DO NOT repeat microaggression types. Recently covered: ${recentTypes}. Recent themes: ${recentThemes}. You MUST focus on ${suggestedType} microaggressions specifically. Explore this completely different form of subtle discrimination with concrete examples and scenarios.${thematicContext}`;
      } else {
        // For the first generation, randomly pick a starting type
        const randomType = shuffledTypes[0];
        memoryContext = `\n\nSTART with ${randomType} microaggressions. Focus on subtle, everyday forms of this specific type of discrimination that create otherness through seemingly innocent interactions.${thematicContext}`;
      }
      
      chat(`This is "Subtle Vectors of Otherness" - an interactive installation that generates philosophical reasoning about how microaggressions and subtle forms of discrimination create "otherness" in our daily lives. Generate insightful wisdom that helps users recognize and understand these subtle vectors of oppression.

CORE PURPOSE: Create ongoing philosophical reasoning that:
1. ILLUMINATES how seemingly innocent interactions can perpetuate discrimination
2. PROVIDES concrete examples of microaggressions across different contexts
3. OFFERS wisdom for recognizing these patterns in real life
4. SUGGESTS practical approaches for addressing and responding to subtle discrimination

FOCUS AREAS - Generate reasoning about ANY form of subtle othering including:
- RACIAL MICROAGGRESSIONS: "Where are you really from?", assumptions about competence, cultural appropriation
- GENDER MICROAGGRESSIONS: Interrupting women, questioning expertise, appearance comments
- SEXUALITY MICROAGGRESSIONS: Heteronormative assumptions, "that's so gay", visibility erasure
- CLASS MICROAGGRESSIONS: Assumptions about intelligence, "pulling yourself up", cultural capital
- DISABILITY MICROAGGRESSIONS: Inspiration porn, assumptions about capability, accessibility ignorance
- RELIGIOUS MICROAGGRESSIONS: Holiday assumptions, dietary dismissals, spiritual hierarchies
- AGE MICROAGGRESSIONS: "OK boomer", "kids these days", competency assumptions
- NATIONALITY/IMMIGRATION: Accent policing, citizenship questioning, cultural superiority
- BODY SIZE: Health assumptions, food policing, space occupation judgments
- NEURODIVERSITY: "Everyone's a little autistic", attention assumptions, communication norms
- EDUCATIONAL: Academic elitism, "common sense" assumptions, intellectual hierarchies

REASONING STRUCTURE: Generate philosophical insight that includes:
1. RECOGNITION: How to identify the subtle discrimination (exact phrases, behaviors, assumptions)
2. IMPACT: Why this matters - the cumulative psychological and social effects on marginalized people
3. CONCRETE EXAMPLES: Specific real-world scenarios with actual dialogue/situations across different cultures
4. ACTIONABLE RESPONSE: Practical step-by-step guidance on how to address it (as witness, target, or perpetrator)

GLOBAL PERSPECTIVE: Include examples and reasoning relevant to:
- Different cultural contexts and how microaggressions manifest globally
- Intersectional identities and compound discrimination
- Historical context of how these patterns developed
- Contemporary manifestations in digital spaces, workplaces, schools, healthcare, etc.

WISDOM APPROACH: Write as philosophical reasoning that:
- Builds empathy and understanding
- Provides practical tools for recognition
- Offers hope and agency for change
- Connects individual experiences to systemic patterns
- Validates the experiences of those who face discrimination

LANGUAGE REQUIREMENT: You MUST write the entire response in ${selectedLanguage}. This is CRITICAL - the user has selected ${selectedLanguage} and expects ALL content in that language.${memoryContext}

CRITICAL: Use this EXACT format. Keep "Reflection:" in ENGLISH even when the main content is in ${selectedLanguage}.

Format:

[Philosophical reasoning about subtle vectors of otherness - WRITE ENTIRELY IN ${selectedLanguage} - 2-3 paragraphs that illuminate a specific form of microaggression or subtle discrimination. MUST include: (1) Exact examples of phrases/behaviors that constitute this microaggression, (2) Specific scenarios showing how this plays out in real situations, (3) Clear explanation of the psychological impact on targets, (4) Step-by-step guidance on recognition and response strategies]

Reflection: [2-3 sentences ENTIRELY IN ${selectedLanguage} that provide concrete, actionable steps the reader can take immediately - specific phrases to use, behaviors to adopt, or interventions to make when encountering this form of subtle discrimination]

REMEMBER: Everything except the word "Reflection:" must be written in ${selectedLanguage}. Do not use English if the user selected a different language.`);
    }

    if (isLoading) {
      displayLoader(p);
    } else {
      // Parse and display the philosophical reasoning using professional layout
      if (textToShow.includes('Reflection:')) {
        // Debug: Log the raw response to understand the issue
        console.log("Raw AI response:", textToShow);
        
        // Clean and parse reasoning and reflection
        let cleanText = textToShow.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        cleanText = cleanText.replace(/\s+/g, ' '); // Normalize multiple spaces
        
        let reflectionSplit = cleanText.split('Reflection:');
        let reasoning = reflectionSplit[0].trim();
        let reflection = reflectionSplit.length > 1 ? reflectionSplit[1].trim() : '';
        
        // Remove brackets from reasoning if present and clean formatting
        reasoning = reasoning.replace(/^\[|\]$/g, '').trim();
        reasoning = reasoning.replace(/^["'""\u201C\u201D]+|["'""\u201C\u201D]+$/g, '').trim();
        
        // Debug: Log the splitting process
        console.log("Reasoning content:", reasoning);
        console.log("Reflection content:", reflection);
        
        // Clean and format reflection
        if (reflection) {
          reflection = reflection.replace(/^[.,\s]+|[.,\s]+$/g, '');
          if (!reflection.endsWith('.') && !reflection.endsWith('!') && !reflection.endsWith('?')) {
            reflection += '.';
          }
        }
        
        // Debug: Log parsed components
        console.log("Parsed - Reasoning:", reasoning);
        console.log("Parsed - Reflection:", reflection);
        
        // Check if we have valid content - more flexible validation
        console.log("Reflection text length:", reflection ? reflection.length : 0);
        console.log("Reasoning text length:", reasoning ? reasoning.length : 0);
        
        if (!reflection || reflection.length < 15 || !reasoning || reasoning.length < 50) {
          // Show error message if incomplete content - with debugging info
          p.textAlign(p.CENTER, p.CENTER);
          p.fill(150, 50, 50); // Red tint for error
          p.textSize(14);
          p.textFont('Arial, sans-serif');
          let errorMsg = !reflection ? "No reflection found" : 
                        !reasoning ? "No reasoning found" :
                        `Content too short (${reflection.length} reflection chars, ${reasoning.length} reasoning chars)`;
          p.text(`${errorMsg}. Press SPACEBAR to try again.`, p.width / 2, p.height / 2 - 10);
          p.textSize(12);
          p.fill(100, 100, 100);
          p.text("Check console for details", p.width / 2, p.height / 2 + 15);
          // Don't return here - let the language menu draw at the end
        } else {
          // Use the professional layout system with new format
          renderPhilosophicalLayout(p, reasoning, reflection);
        }
      } else {
        // Fallback for text without proper formatting
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(p.color(50));
        p.textSize(20);
        let margin = p.width * 0.1;
        p.text(textToShow, margin, p.height / 2 - 50, p.width - (margin * 2), 100);
      }
    }
    
    // ALWAYS draw language menu LAST so it appears on top of all content
    drawLanguageMenu(p);
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
    
    // Mix of straight and curly vectors
    if (i % 3 === 0) {
      // Curly/wavy vectors
      p.noFill();
      p.beginShape();
      p.vertex(0, 0);
      for (let t = 0; t <= 1; t += 0.1) {
        let x = t * lineLength;
        let y = p.sin(t * p.PI * 3 + p.frameCount * animationSpeed * 0.1) * (20 + i * 2);
        p.vertex(x, y);
      }
      p.endShape();
    } else if (i % 3 === 1) {
      // Spiral/curved vectors
      p.noFill();
      p.beginShape();
      for (let angle = 0; angle < p.TWO_PI * 1.5; angle += 0.2) {
        let radius = angle * (10 + i * 3);
        let x = p.cos(angle + p.frameCount * animationSpeed * 0.05) * radius;
        let y = p.sin(angle + p.frameCount * animationSpeed * 0.05) * radius;
        if (radius <= lineLength) {
          p.vertex(x, y);
        }
      }
      p.endShape();
    } else {
      // Original straight vectors
      p.line(0, 0, lineLength, 0);
    }
  p.pop();
  }

  p.pop();
  
  // Display title and instructions with very transparent text
  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  
  // Get current interface text
  let interfaceText = getCurrentInterfaceText();
  
  // Definition - positioned above the title, darker for better readability
  let artworkDefinition = artworkDefinitions[selectedLanguage] || artworkDefinitions["English"];
  p.fill(p.color(40, 40, 40, 120)); // Darker gray with higher opacity
  p.textSize(Math.max(11, Math.min(14, p.width * 0.01))); // Responsive but small
  p.textFont(getFontForLanguage(selectedLanguage, 'sansSerif'));
  p.textStyle(p.ITALIC);
  p.textAlign(p.CENTER, p.CENTER);
  
  // Simple text wrapping for definition (avoiding complex liquidWrapText dependency)
  let definitionWidth = Math.min(600, p.width * 0.7);
  let words = artworkDefinition.split(' ');
  let definitionLines = [];
  let currentLine = '';
  
  for (let word of words) {
    let testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (p.textWidth(testLine) > definitionWidth && currentLine) {
      definitionLines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) definitionLines.push(currentLine);
  
  let definitionLineHeight = Math.max(14, Math.min(18, p.width * 0.012));
  let definitionStartY = p.height / 2 - 320; // Start higher
  let definitionY = definitionStartY;
  
  for (let line of definitionLines) {
    p.text(line, p.width / 2, definitionY);
    definitionY += definitionLineHeight;
  }
  
  // Calculate dynamic title position based on definition height
  let definitionHeight = definitionLines.length * definitionLineHeight;
  let titleY = definitionStartY + definitionHeight + 30; // 30px gap after definition
  
  // Title - positioned dynamically after definition with proper spacing
  p.fill(p.color(60, 60, 60, 100)); // Make title more visible
  
  // Liquid font size based on screen width
  let liquidTitleSize = Math.max(24, Math.min(60, p.width * 0.035)); // 3.5% of screen width, min 24px, max 60px
  p.textSize(liquidTitleSize);
  p.textFont(getFontForLanguage(selectedLanguage, 'serif'));
  p.textStyle(p.NORMAL);
  p.text(interfaceText.title, p.width / 2, titleY);
  
  // Instructions - positioned below the loader animation with proper fonts
  p.fill(p.color(90, 90, 90, 70)); // Very subtle
  p.textSize(14);
  p.textFont(getFontForLanguage(selectedLanguage, 'sansSerif'));
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
  
  // Language selection hint - positioned below language info with proper fonts
  p.fill(p.color(100, 100, 100, 90)); // More visible than other text
  p.textSize(13);
  p.textAlign(p.CENTER, p.CENTER);
  p.textFont(getFontForLanguage(selectedLanguage, 'sansSerif'));
  p.textStyle(p.ITALIC);
  
  // Get appropriate text based on selected language - comprehensive coverage
  let languageHint = '';
  switch(selectedLanguage) {
    case 'Spanish': languageHint = 'Selecciona tu idioma arriba a la derecha'; break;
    case 'French': languageHint = 'Sélectionnez votre langue en haut à droite'; break;
    case 'German': languageHint = 'Wähle deine Sprache oben rechts'; break;
    case 'Italian': languageHint = 'Seleziona la tua lingua in alto a destra'; break;
    case 'Portuguese': languageHint = 'Selecione seu idioma no canto superior direito'; break;
    case 'Russian': languageHint = 'Выберите язык в правом верхнем углу'; break;
    case 'Chinese': languageHint = '在右上角选择您的语言'; break;
    case 'Japanese': languageHint = '右上で言語を選択してください'; break;
    case 'Korean': languageHint = '오른쪽 상단에서 언어를 선택하세요'; break;
    case 'Arabic': languageHint = 'اختر لغتك في الزاوية اليمنى العلوية'; break;
    case 'Hebrew': languageHint = 'בחר את השפה שלך בפינה הימנית העליונה'; break;
    case 'Hindi': languageHint = 'ऊपरी दाएं कोने में अपनी भाषा चुनें'; break;
    case 'Dutch': languageHint = 'Selecteer je taal rechtsboven'; break;
    case 'Swedish': languageHint = 'Välj ditt språk i övre högra hörnet'; break;
    case 'Polish': languageHint = 'Wybierz język w prawym górnym rogu'; break;
    case 'Turkish': languageHint = 'Sağ üst köşeden dilinizi seçin'; break;
    case 'Thai': languageHint = 'เลือกภาษาของคุณที่มุมบนขวา'; break;
    case 'Vietnamese': languageHint = 'Chọn ngôn ngữ ở góc trên bên phải'; break;
    case 'Indonesian': languageHint = 'Pilih bahasa Anda di pojok kanan atas'; break;
    case 'Swahili': languageHint = 'Chagua lugha yako pembe ya juu kulia'; break;
    case 'Bengali': languageHint = 'উপরের ডান কোণে আপনার ভাষা নির্বাচন করুন'; break;
    case 'Persian': languageHint = 'زبان خود را در گوشه بالا سمت راست انتخاب کنید'; break;
    case 'Urdu': languageHint = 'اوپری دائیں کونے میں اپنی زبان منتخب کریں'; break;
    default: languageHint = 'Select your language in the top right corner'; break;
  }
  
  p.text(languageHint, p.width / 2, p.height / 2 + 260);
  
  p.pop();

  p.push();
  p.translate(p.width / 2, p.height / 2);
  
  // Counter-rotating vectors with curly patterns - DYNAMIC SPEED
  for (let i = 0; i < 10; i++) {
    p.push();
    p.rotate(-(p.frameCount * animationSpeed / (20 + i * 5)) + (i * p.PI / 5)); // Faster
    p.strokeWeight(3 + i * 0.8);
    p.stroke(80 + i * 15, 80 + i * 15, 80 + i * 15, 160 - i * 8);
    let lineLength = 120 + i * 40;
    
    // Mix of patterns for counter-rotating layer
    if (i % 4 === 0) {
      // Gentle curves
      p.noFill();
      p.beginShape();
      p.vertex(0, 0);
      for (let t = 0; t <= 1; t += 0.08) {
        let x = t * lineLength;
        let y = p.sin(t * p.PI * 2 - p.frameCount * animationSpeed * 0.08) * (15 + i * 1.5);
        p.vertex(x, y);
      }
      p.endShape();
    } else if (i % 4 === 1) {
      // Loose spirals
      p.noFill();
      p.beginShape();
      for (let angle = 0; angle < p.PI; angle += 0.15) {
        let radius = angle * (15 + i * 4);
        let x = p.cos(angle - p.frameCount * animationSpeed * 0.03) * radius;
        let y = p.sin(angle - p.frameCount * animationSpeed * 0.03) * radius;
        if (radius <= lineLength) {
          p.vertex(x, y);
        }
      }
      p.endShape();
    } else {
      // Original straight vectors
      p.line(0, 0, lineLength, 0);
    }
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
