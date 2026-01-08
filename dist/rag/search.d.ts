import "dotenv/config";
export declare function ragQuery(question: string, tone: string, options?: {}): Promise<{
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
export declare function ragQueryWithHistory(question: string, sessionId?: string): Promise<{
    historyLength: any;
    answer: string;
    sources: never[];
    scores: never[];
    confidence: number;
    totalSources?: never;
    error?: never;
} | {
    historyLength: any;
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
    historyLength: any;
    answer: string;
    sources: never[];
    scores: never[];
    confidence: number;
    error: any;
    totalSources?: never;
}>;
//# sourceMappingURL=search.d.ts.map