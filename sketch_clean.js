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
  }
  // Add more translations as needed...
};

// Memory system to prevent repetition and build contextual awareness
let usedQuotes = new Set(); // Store hash of used quotes
let usedAuthors = new Set(); // Store used author names
let generationHistory = []; // Store full generation context
let contextualMemory = []; // Store themes and patterns from previous generations

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
  
  // Render context explanation
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
      // Parse and display the text using professional layout
      if (textToShow.includes('—')) {
        // Clean and parse quote, author, and context
        let cleanText = textToShow.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
        cleanText = cleanText.replace(/\s+/g, ' '); // Normalize multiple spaces
        
        let authorSplit = cleanText.split('—');
        let quote = authorSplit[0].trim();
        let authorAndContext = authorSplit[1].trim();
        
        // Remove brackets from quote if present and clean formatting
        quote = quote.replace(/^\[|\]$/g, '').trim();
        quote = quote.replace(/^["'""\u201C\u201D]+|["'""\u201C\u201D]+$/g, '').trim();
        
        let contextSplit = authorAndContext.split('Context:');
        let authorText = contextSplit[0].trim();
        let contextText = contextSplit.length > 1 ? contextSplit[1].trim() : '';
        
        // Clean and format author
        authorText = authorText.replace(/^[.,\s]+|[.,\s]+$/g, '');
        let author = '— ' + authorText;
        
        // Clean and format context
        let context = '';
        if (contextText) {
          contextText = contextText.replace(/^[.,\s]+|[.,\s]+$/g, '');
          if (!contextText.endsWith('.') && !contextText.endsWith('!') && !contextText.endsWith('?')) {
            contextText += '.';
          }
          context = contextText;
        }
        
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
