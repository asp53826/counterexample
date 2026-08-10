export type TapeState = "neutral" | "fail" | "inspect" | "pass";

export interface Metric {
  label: string;
  broken: string;
  guarded: string;
  unit: string;
}

export interface TimelineStep {
  phase: "trigger" | "propagate" | "witness" | "guard" | "receipt" | "boundary";
  title: string;
  detail: string;
  state: TapeState;
}

export interface Capsule {
  schemaVersion: number;
  id: string;
  caseNumber: string;
  title: string;
  system: string;
  engine: string;
  commit: string;
  disposition: "guarded" | "bounded" | "repaired";
  severity: "critical" | "high" | "medium";
  verifiedAt: string;
  faultKind: string;
  invariantId: string;
  summary: string;
  trigger: string;
  observed: string;
  invariant: string;
  fix: string;
  verification: {
    commandId: string;
    testPath: string;
    testLines: [number, number];
    result: string;
    benchmarkPath?: string;
    benchmarkLines?: [number, number];
  };
  metrics: Metric[];
  timeline: TimelineStep[];
  limits: string[];
  tags: string[];
}

export interface Engine {
  repository: string;
  commit: string;
  commands: Record<string, { display: string; kind: string; expected: string }>;
}
