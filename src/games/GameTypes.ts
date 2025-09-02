export type Outcome = "win" | "loss" | "draw";
export type GameSessionResult = {
  outcome: Outcome;
  meta?: Record<string, unknown>;
};
export type GameMeta = {
  id: string;
  name: string;
  capabilities: Record<string, unknown>;
  defaultSettings?: Record<string, unknown>;
};
export type GameProps = {
  settings: Record<string, unknown>;
  onFinish: (result: GameSessionResult) => void;
  playerRole?: "host" | "guest" | "solo";
};
export type GameModule = {
  meta: GameMeta;
  default: (props: GameProps) => JSX.Element;
};