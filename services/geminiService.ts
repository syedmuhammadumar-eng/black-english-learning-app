
import { GoogleGenAI, Type } from "@google/genai";
import type { FillInTheBlankExercise, QuizQuestion, RevisionCard, VocabularyItem, GrammarError } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const generateFillInTheBlanks = async (tense: string): Promise<FillInTheBlankExercise[]> => {
    const prompt = `Generate 20 unique fill-in-the-blank sentences for practicing the '${tense}' tense. For each sentence, provide the sentence with '___' as a placeholder, the correct verb form that fits in the blank, and the base verb. The target audience is an Urdu speaker learning English. Ensure sentences are practical for daily conversation.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: { type: Type.STRING, description: "The sentence with a '___' placeholder." },
                        correctAnswer: { type: Type.STRING, description: "The correct word for the blank." },
                        baseVerb: { type: Type.STRING, description: "The base form of the verb used." },
                    },
                    required: ["sentence", "correctAnswer", "baseVerb"],
                },
            },
        },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.map((item: any, index: number) => ({ ...item, id: `${tense}-${index}` }));
};


export const generateQuiz = async (tense: string): Promise<QuizQuestion[]> => {
    const prompt = `Generate a 10-question multiple-choice quiz about the '${tense}' tense. Each question should test a specific rule or usage of this tense. Provide 4 options for each question, one of which is correct. The target audience is an intermediate English learner whose native language is Urdu.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                    },
                    required: ["question", "options", "correctAnswer"],
                },
            },
        },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.map((item: any, index: number) => ({ ...item, id: `quiz-${tense}-${index}` }));
};

export const generateVocabularyList = async (): Promise<VocabularyItem[]> => {
    const prompt = `Generate a list of 15 advanced but common English vocabulary words used in movies. For each word, provide its definition, an example sentence, and a simple translation in Urdu. The target audience is an Urdu speaker learning English. Format the Urdu translation in Roman script (e.g., "shukriya" not "شکریہ").`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        example: { type: Type.STRING },
                        urduTranslation: { type: Type.STRING },
                    },
                    required: ["word", "definition", "example", "urduTranslation"],
                },
            },
        },
    });

    return JSON.parse(response.text);
};

export const generateRevisionCards = async (): Promise<RevisionCard[]> => {
    const prompt = `Generate 3 concise daily revision cards for an English learner. Each card should cover a different, useful grammar tip or a common mistake to avoid. Each card should have a clear title and brief, easy-to-understand content.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                    },
                    required: ["title", "content"],
                },
            },
        },
    });

    return JSON.parse(response.text);
};


export const generateWritingTask = async (): Promise<string> => {
    const prompt = "Generate a single, engaging writing prompt for an intermediate English learner. The prompt should encourage them to use descriptive language and write about a personal experience or opinion. Make it one sentence.";
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
};

export const checkWritingGrammar = async (text: string): Promise<GrammarError[]> => {
    const prompt = `You are an expert English grammar checker for an ESL student whose primary language is Urdu. Analyze the following text for grammatical errors. For each error, provide the incorrect phrase, a correction, and a simple explanation of the rule. If there are no errors, return an empty array.
Text: "${text}"`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        error: { type: Type.STRING, description: "The incorrect phrase from the text." },
                        correction: { type: Type.STRING, description: "The suggested correction." },
                        explanation: { type: Type.STRING, description: "A simple explanation of the grammar rule." },
                    },
                    required: ["error", "correction", "explanation"],
                },
            },
        },
    });

    return JSON.parse(response.text);
};
