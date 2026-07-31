import { z } from "zod";

export interface PollOption {
  readonly id: string;
  readonly label: string;
}

export const pollOptionLabelSchema = z
  .string()
  .trim()
  .min(1, "חובה למלא טקסט לתשובה")
  .max(50, "התשובה ארוכה מדי");

export const pollInputSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "חובה למלא שאלה")
    .max(200, "השאלה ארוכה מדי"),
  optionLabels: z
    .array(pollOptionLabelSchema)
    .min(2, "צריך לפחות שתי תשובות")
    .max(4, "אפשר עד ארבע תשובות"),
});

export const voteInputSchema = z.object({
  pollId: z.uuid(),
  optionId: z.string().min(1).max(64),
});

export interface PollResults {
  readonly results: ReadonlyArray<{ readonly optionId: string; readonly count: number }>;
  readonly total: number;
}
