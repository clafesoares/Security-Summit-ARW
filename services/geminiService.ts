import { GoogleGenAI } from "@google/genai";
import { SecurityTip } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMonasteryWisdom = async (): Promise<SecurityTip> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Gera um conselho curto e enigmático sobre segurança informática, escrito no estilo de um monge de um mosteiro antigo. Deve ser uma frase seguida de uma breve tradução moderna. Responde em Português de Portugal.",
      config: {
        systemInstruction: "Tu és um ciber-monge da Ordem do Escudo Digital. Fala por enigmas relacionados com firewalls, encriptação e paciência.",
      },
    });

    const text = response.text || "A paciência é a firewall da alma. (Espera antes de clicar.)";
    
    // Simple parsing assumption for the demo
    const parts = text.split('(');
    const title = parts[0]?.trim() || "O Pergaminho Digital";
    const content = parts.length > 1 ? `(${parts[1]}` : "";

    return { title, content };
  } catch (error) {
    console.error("Gemini Wisdom Error:", error);
    return {
      title: "O Silêncio é Dourado",
      content: "Garante que as tuas palavras-passe são fortes e silenciosas como as paredes de pedra.",
    };
  }
};