export const choices = ["rock", "paper", "scissors"] as const;
export type Choice = typeof choices[number];

export function decide(a: Choice, b: Choice) {
  if (a === b) return "draw";
  if ((a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper")) return "win";
  return "loss";
}