
export enum TranslationTone {
  CASUAL = 'casual',
  FORMAL = 'formal'
}

export interface TranslationState {
  inputText: string;
  outputText: string;
  isTranslating: boolean;
  error: string | null;
  tone: TranslationTone;
  fileName: string | null;
}
