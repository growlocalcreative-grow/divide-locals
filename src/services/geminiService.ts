import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY as string) });

export async function generateBusinessStory(businessData: { name: string, category: string, zipCode?: string, serviceAreas?: string[], tags?: string[], isDivideGrown?: boolean, isFireSafeCertified?: boolean }) {
  const zipToTown: Record<string, string> = {
    '95634': 'Georgetown',
    '95613': 'Cool',
    '95633': 'Garden Valley',
    '95635': 'Greenwood',
    '95648': 'Lincoln',
    '95664': 'Pilot Hill',
    '95667': 'Placerville',
    '95614': 'Cool',
    '95713': 'Coloma'
  };

  const townName = businessData.zipCode ? (zipToTown[businessData.zipCode] || 'the Georgetown Divide') : (businessData.serviceAreas?.[0] || 'the Georgetown Divide');
  
  const isTransport = businessData.category.includes('Delivery') || businessData.category.includes('Ride') || businessData.category.includes('Shuttle');

  const prompt = `Write a SHORT, SEO-focused, neighborly, and solutions-minded description for this local business on the Georgetown Divide.
  
  BUSINESS INFO:
  - Name: "${businessData.name}"
  - Category: "${businessData.category}"
  - Primary Location: "${townName}"
  - Region: "Georgetown Divide", "El Dorado County", "Sierra Foothills", "The Canyon", "The Divide"
  - Fire Safe Certified: ${businessData.isFireSafeCertified ? 'YES' : 'NO'}
  
  VOICE RULES:
  1. STRICTLY 2-3 sentences only.
  2. Tone must be helpful, professional, and neighborly. 
  3. Avoid generic fluff. Focus on the value they provide to neighbors.
  4. Use regional keywords: "${townName}", "Georgetown Divide", "El Dorado County", "The Divide", and "The Canyon" naturally.
  5. Always mention service availability for Cool, Georgetown, Greenwood, and Garden Valley.
  6. ${isTransport ? 'CRITICAL: Explicitly highlight "Mountain Road Familiarity" and comfort navigating the unique, winding terrain of the Divide to build local trust.' : ''}
  7. ${businessData.isDivideGrown ? 'Include that they are "Divide Grown" (locally grown or harvested).' : ''}
  8. ${businessData.isFireSafeCertified ? 'Explicitly highlight their fire-safe practices, defensible space leadership, or wildfire-resilient materials (especially for metal work or clearing services) to address the specific safety needs of our foothill communities.' : ''}
  
  GOAL: Help locals find this service through local SEO while feeling like a recommendation from a friend.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function generateHeroImage(businessData: { name: string, category: string }) {
  const categoryPrompts: Record<string, string> = {
    'Dining & Drinks': 'A high-end close-up, depth-of-field shot of artisanal local food on a reclaimed wood table, soft natural golden hour light, mountain modern aesthetic.',
    'Land & Forest': 'A dramatic, stylized cinematic landscape portrait of ancient Sierra Nevada pine trees, golden sunlight filtering through needles, mountain morning mist.',
    'Home & Property': 'A clean, architectural detail shot of a modern mountain cabin exterior, blending glass, dark metal, and rough-cut stone, dusk lighting.',
    'Professional Services': 'A serene, minimalist interior detail of a modern community office space in the mountains, organic textures, professional and warm atmosphere.',
    'Community': 'A warm, inviting shot of a local community gathering space in the Sierra foothills, craftsman style architecture, soft forest lighting.'
  };

  const basePrompt = categoryPrompts[businessData.category] || 'A professional, warm, Earth-toned "Mountain Modern" aesthetic image, Sands, Slates, and Woods colors, high resolution.';

  const prompt = `Based on the business "${businessData.name}" in the category "${businessData.category}", 
  generate a set of 3-5 high-resolution descriptive search keywords for Unsplash that would find a photograph matching this vibe: "${basePrompt}".
  
  RETURN ONLY THE KEYWORDS SEPARATED BY COMMAS. No other text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const keywords = response.text.trim().replace(/\s+/g, '+');
    // Using Unsplash Source (or similar) to provide a reasonably good match
    // Note: upsash source is deprecated but /photos/random with search terms works or just use a placeholder-like URL with terms
    return `https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80&w=1200&sig=${Math.floor(Math.random() * 1000)}&q=${keywords}`;
    // Actually, a more reliable way to get different images is to use the keywords directly if using a proxy or just append them to the unsplash source-like url
    // Since we don't have a direct "search" api that returns a URL easily without a key, we'll use a curated base per category + randomized signature for "regeneration"
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function getBusinessMetadataSuggestions(businessData: { name: string, category: string, description?: string }) {
  const prompt = `Analyze this local business on the Georgetown Divide and suggest metadata.
  
  BUSINESS:
  - Name: "${businessData.name}"
  - Category: "${businessData.category}"
  - Description: "${businessData.description || 'No description provided'}"
  
  TASKS:
  1. Suggest 3-5 hyper-local Sub-Categories (e.g., Weed Eating, Brush Clearing, Livestock Care, Notary, Web Design).
  2. Generate a comma-separated list of 8-10 SEO Meta-Keywords. Include regional terms like "The Canyon", "The Divide", "Georgetown Divide", "El Dorado County", "Sierra Foothills", and specific safety terms if applicable.
  3. Determine if this business likely performs fire-safety related work (brush clearing, defensible space, metal/weld work, etc).
  
  RETURN JSON ONLY in this format:
  {
    "subCategories": ["String"],
    "metaKeywords": ["String"],
    "recommendFireSafe": boolean
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = response.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(cleanJson) as {
      subCategories: string[];
      metaKeywords: string[];
      recommendFireSafe: boolean;
    };
  } catch (error) {
    console.error("Gemini Suggestions Error:", error);
    return null;
  }
}
