export type documentationData = {
  hasReadme: boolean;
  numLines: number;
  hasExamples: boolean;
  hasDocumentation: boolean;
};

export type repoLatencyData = {
  contributors: number;
  openIssues: number;
  closedIssues: number;
  lastCommitDate: number;
  licenses: number;
  numberOfCommits: number;
  numberOfLines: number;
  documentation: number;
}