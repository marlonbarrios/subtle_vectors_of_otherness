# Subtle Vectors of Otherness

An interactive generative art installation that generates philosophical reasoning about microaggressions and subtle vectors of otherness, providing wisdom to recognize and address everyday discrimination.

**🌐 [Experience the Live Installation](https://subtle-vectors-of-otherness.vercel.app/)**

<img src="00-homepage-hero-image.png" alt="Subtle Vectors of Otherness - Home Page" width="100%">

## About the Installation

**Subtle Vectors of Otherness** is a critical media art installation designed for art exhibitions that generates ongoing philosophical reasoning about microaggressions and subtle forms of discrimination. The work illuminates how seemingly innocent interactions can perpetuate systems of oppression and provides practical wisdom for recognizing and addressing these patterns.

This installation is part of **Pangea_IA**, a collaborative project developed in partnership with **Maria Luisa Angulo** that explores the intersection of artificial intelligence, cultural identity, and critical discourse in contemporary digital art practices.

This interactive installation generates real-time philosophical reasoning about different types of microaggressions—racial, gender, sexuality, class, disability, age, religion, nationality, body size, neurodiversity, and educational hierarchies. Each generation provides concrete examples, explains psychological impacts, and offers actionable guidance for recognition and response. The work operates across 70+ languages and prioritizes diverse global perspectives on subtle discrimination.

## Screenshots

### Home Page - Multilingual Interface
<img src="01-homepage-multilingual-interface.png" alt="Home Page with Curly Vector Animation" width="800">

*The installation's home page featuring the dynamic curly vector animation, artwork definition, and multilingual language selection interface.*

### Philosophical Reasoning - Microaggression Analysis
<img src="02-quote-generation-analysis.png" alt="Generated Philosophical Reasoning" width="800">

*Example of generated philosophical reasoning about microaggressions, showing concrete examples, psychological impact analysis, and actionable response strategies.*

### Language Selection Menu
<img src="03-language-selection-menu.png" alt="Multilingual Support" width="800">

*The scrollable language selection menu showing support for 70+ languages with proper font rendering for diverse writing systems.*

### Exhibition Footer
<img src="05-exhibition-footer.png" alt="Project Attribution" width="800">

*The footer section displaying project credits, exhibition information, and interactive portfolio link for the Pangea_IA collaboration.*

## Concept

The installation generates philosophical reasoning about microaggressions across multiple dimensions:

- **Recognition Training**: Teaching viewers to identify subtle forms of discrimination through concrete examples and specific phrases
- **Impact Understanding**: Explaining the cumulative psychological and social effects of microaggressions on marginalized communities
- **Intersectionality**: Examining how different forms of subtle discrimination (race, gender, sexuality, class, disability, religion, age, nationality, body size, neurodiversity, education) intersect and compound
- **Actionable Response**: Providing step-by-step guidance for addressing microaggressions as witness, target, or perpetrator
- **Global Perspective**: Including examples relevant to different cultural contexts and contemporary manifestations across digital spaces, workplaces, schools, and healthcare

## Features

### 🌍 **Multilingual Support**
- **70+ Languages**: Complete interface translation and content generation
- **Proper Font Support**: Specialized fonts for CJK (Chinese, Japanese, Korean), Arabic, Hebrew, Thai, Hindi, Bengali, Russian, and African languages
- **Cultural Sensitivity**: Language-specific considerations and culturally appropriate content

### 🎨 **Interactive Experience**
- **Continuous Generation**: Press spacebar to activate continuous mode with 2-minute intervals
- **Bottom-to-Top Scrolling**: Text scrolls upward for contemplative reading experience
- **Randomized Content**: Smart system prevents repetitive examples across 11 microaggression categories
- **Language Selection**: Scrollable dropdown menu with all available languages
- **Consistent Typography**: Stable font sizes across all generations for optimal readability
- **Responsive Design**: Adapts to different screen sizes and devices
- **Smooth Animations**: Dynamic loading animation with curly vector patterns
- **Minimal Design**: Clean grayscale interface suitable for exhibition spaces

### 🧠 **AI-Powered Content**
- **Philosophical Reasoning**: Generates insightful wisdom about recognizing and addressing microaggressions
- **Smart Randomization**: Rotates through 11 different categories (racial, gender, sexuality, class, disability, age, religion, nationality, body size, neurodiversity, educational)
- **Memory System**: Tracks recent themes to ensure diverse content and prevent repetition
- **Concrete Examples**: Provides specific phrases, behaviors, and real-world scenarios
- **Actionable Guidance**: Step-by-step instructions for recognition and response strategies
- **Cultural Context**: Examples relevant to different global contexts and intersectional identities

### 📱 **Technical Features**
- **Liquid Typography**: Responsive text that adapts to content and screen size
- **Consistent Font Sizing**: Stable typography across generations with gentle scaling only when necessary
- **Scrolling Animation**: Smooth bottom-to-top text movement with adjustable speed
- **Auto-Generation**: Automatic content generation every 2 minutes in continuous mode
- **Professional Layout**: Advanced p5.js text rendering with overflow protection
- **Error Handling**: Robust validation and user feedback

## Installation Setup

### Prerequisites
- **Node.js** (version 16 or later)
- **OpenAI API Key** (GPT-4 access required)

### Quick Start

1. **Clone or Download** this repository
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set API Key**: Create a `.env` file in the root directory:
   ```
   VITE_OPENAI_KEY=your_openai_api_key_here
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
5. **Open in Browser**: Navigate to `http://localhost:5173/`

### Production Deployment
- Configure environment variables for your hosting platform
- Ensure proper HTTPS setup for API security
- Test across different devices and browsers

## How to Use

### **For Exhibition Visitors:**
1. **Select Language**: Click the language dropdown (top-right) to choose from 70+ languages
2. **Read Definition**: The home page explains what "Subtle Vectors of Otherness" means
3. **Activate Generation**: Press SPACEBAR to start continuous generation mode
4. **Read & Contemplate**: Each philosophical reasoning appears for 2 minutes with scrolling animation
5. **Generate New Content**: Press SPACEBAR again to immediately generate new reasoning and restart the cycle
6. **Navigate**: Press ESC to return to the home page and stop continuous mode

### **For Curators and Exhibitors:**
- **Full-screen Mode**: The installation is designed for full-screen display
- **Continuous Operation**: 2-minute intervals provide contemplative pacing for exhibition spaces
- **Diverse Content**: Smart randomization ensures visitors see different microaggression categories
- **Multilingual**: Supports 70+ languages for international exhibitions
- **No Internet Required**: Once loaded, works offline (except for new generations)
- **Accessible**: Supports screen readers and keyboard navigation
- **Educational**: Each generation provides concrete examples and actionable guidance

## Technical Architecture

### **Frontend**
- **p5.js**: Creative coding framework for animations and interactions
- **Vite**: Modern build tool and development server
- **Vanilla JavaScript**: No framework dependencies for maximum compatibility

### **AI Integration**
- **OpenAI GPT Integration**: Advanced language models for generating philosophical reasoning
- **Smart Randomization**: Algorithmic selection of microaggression categories to prevent repetition
- **Custom Prompts**: Sophisticated prompt engineering focused on microaggression education
- **Multi-language Support**: Consistent generation across all supported languages with strong language enforcement
- **Memory Management**: Contextual tracking of recent themes and response approaches

### **Text Rendering**
- **Liquid Typography**: Custom text wrapping and sizing system
- **Font Management**: Language-specific font stacks for proper character display
- **Consistent Sizing**: Stable font sizes across generations with minimal scaling
- **Scrolling Animation**: Bottom-to-top text movement with configurable speed
- **Responsive Layout**: Adapts to content length and screen size while maintaining readability

## Content Guidelines

The installation generates **philosophical reasoning about microaggressions** across diverse contexts:

### **Content Categories:**
- **Racial Microaggressions**: "Where are you really from?", assumptions about competence, cultural appropriation
- **Gender Microaggressions**: Interrupting women, questioning expertise, appearance comments
- **Sexuality Microaggressions**: Heteronormative assumptions, visibility erasure, identity invalidation
- **Class Microaggressions**: Assumptions about intelligence, "pulling yourself up", cultural capital
- **Disability Microaggressions**: Inspiration porn, assumptions about capability, accessibility ignorance
- **Religious Microaggressions**: Holiday assumptions, dietary dismissals, spiritual hierarchies
- **Age Microaggressions**: Generational stereotypes, competency assumptions, dismissive language
- **Nationality/Immigration**: Accent policing, citizenship questioning, cultural superiority
- **Body Size**: Health assumptions, food policing, space occupation judgments
- **Neurodiversity**: Pathologizing differences, communication norms, attention assumptions
- **Educational**: Academic elitism, "common sense" assumptions, intellectual hierarchies

### **Global Perspectives:**
- **Cultural Context**: Examples relevant to different societies and cultural norms
- **Intersectional Analysis**: How multiple identities compound discrimination experiences
- **Contemporary Manifestations**: Digital spaces, workplaces, schools, healthcare settings

## Educational Value

This installation serves as:
- **Microaggression Recognition Training**: Teaching viewers to identify subtle forms of discrimination
- **Empathy Building**: Understanding the cumulative impact of seemingly small interactions
- **Response Strategy Education**: Providing practical tools for addressing microaggressions
- **Cultural Awareness**: Examining how subtle discrimination manifests across different contexts
- **Intersectional Analysis**: Understanding how multiple forms of oppression compound and interact
- **Preventive Education**: Helping people recognize and modify their own potentially harmful behaviors

## Artist Statement

"Subtle Vectors of Otherness" invites viewers to develop deeper awareness of microaggressions and subtle forms of discrimination that permeate daily interactions. By generating philosophical reasoning about these patterns, the work provides both recognition training and practical wisdom for creating more inclusive environments.

The installation operates across 70+ languages and incorporates diverse global perspectives on subtle discrimination. Through continuous generation and scrolling presentation, the work creates a contemplative space for learning about the cumulative impact of microaggressions and developing skills for recognition, response, and prevention.

## Interface Design

### **Minimalist Layout**
The installation features a clean, focused interface:
- **Top-Right**: Language selection button (70+ languages)
- **Center Stage**: Philosophical reasoning with scrolling animation
- **Full-Width Text**: 95% of screen width for optimal readability
- **Consistent Typography**: Stable font sizes across all generations
- **Professional Appearance**: Clean, minimal design suitable for gallery exhibition

### **Visual Harmony**
- **Grayscale Palette**: Subtle, non-intrusive interface styling
- **Scrolling Animation**: Smooth bottom-to-top text movement for contemplative reading
- **Consistent Typography**: Stable font sizes with gentle scaling when necessary
- **Cultural Sensitivity**: Clean design works across all cultural contexts
- **Exhibition Ready**: Professional aesthetic appropriate for museum spaces

## Technical Support

### **Common Issues:**
- **API Key Problems**: Ensure your OpenAI API key is valid and has GPT access
- **Content Repetition**: The smart randomization system prevents this, but you can press spacebar to generate new content immediately
- **Font Display**: Some languages may require additional system fonts
- **Scrolling Speed**: The animation speed has been optimized for contemplative reading
- **Performance**: Close other applications if experiencing lag during generation

### **Browser Compatibility:**
- **Recommended**: Chrome, Firefox, Safari (latest versions)
- **Mobile**: Works on tablets and phones but optimized for desktop display
- **Accessibility**: Supports keyboard navigation and screen readers

## Contributing

This is an art installation created for exhibition contexts. While the code is available for educational and research purposes, please contact the artist before making derivatives or adaptations.

## Credits

**Pangea_IA Project**: Collaborative project by Marlon Barrios Solano and Maria Luisa Angulo  
**Concept and Programming**: Marlon Barrios Solano  
**Collaboration**: Maria Luisa Angulo  
**Technical Framework**: Built with p5.js, OpenAI GPT-4, and Vite  
**Cultural Consultants**: Various community voices and perspectives  

## License

MIT License - See LICENSE file for details

## Contact

For exhibition opportunities, technical support, or collaboration inquiries:
- **Website**: [Marlon Barrios Solano](https://linktr.ee/marlonbarriososolano)
- **Email**: Contact through official channels

---

*"Subtle Vectors of Otherness" is designed to foster critical awareness of microaggressions and subtle discrimination in contemporary society. The installation provides practical wisdom for recognizing, understanding, and addressing the everyday interactions that can perpetuate systems of exclusion and othering.*

---

## Recent Updates

### **Latest Version Features:**
- **🎲 Smart Randomization**: Prevents repetitive examples across 11 microaggression categories
- **📏 Consistent Typography**: Stable font sizes across all generations for optimal readability  
- **⏰ 2-Minute Intervals**: Contemplative pacing with automatic generation every 2 minutes
- **📜 Scrolling Animation**: Bottom-to-top text movement for immersive reading experience
- **🔄 Continuous Mode**: Press spacebar to activate ongoing generation cycle
- **🌍 Enhanced Multilingual**: Strong language enforcement across 70+ supported languages

*Updated: September 28, 2025*
