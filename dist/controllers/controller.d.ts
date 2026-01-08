export default function getPrompt(query: string, tone: string, jwt: string): Promise<{
    answer: string;
    sources: never[];
    scores: never[];
    confidence: number;
    totalSources?: never;
    error?: never;
} | {
    answer: string;
    sources: {
        index: number;
        score: number;
        title: {};
        path: {};
        chunkIndex: {};
        textPreview: string;
    }[];
    scores: number[];
    confidence: number;
    totalSources: number;
    error?: never;
} | {
    answer: string;
    sources: never[];
    scores: never[];
    confidence: number;
    error: any;
    totalSources?: never;
}>;
//# sourceMappingURL=controller.d.ts.map