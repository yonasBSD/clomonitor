import { CheckSet, Foundation, Maturity } from 'clo-ui';

export interface BaseProject {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  accepted_at?: number;
  home_url?: string;
  logo_url?: string;
  logo_dark_url?: string;
  devstats_url?: string;
  maturity?: Maturity;
  foundation: Foundation;
  category?: string;
  score: { [key in ScoreType]?: number };
  updated_at: number;
}

export interface Project extends BaseProject {
  repositories: BaseRepository[];
}

export interface ProjectDetail extends BaseProject {
  repositories: Repository[];
  snapshots?: string[];
}

export interface BaseRepository {
  name: string;
  url: string;
  check_sets: CheckSet[];
  website_url?: string;
}

export interface Repository extends BaseRepository {
  digest?: string;
  repository_id: string;
  score?: { [key in ScoreType]?: number };
  report?: Report;
}

export interface Report {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: CoreReport | any;
  check_sets?: CheckSet[];
  errors?: string | null;
  report_id: string;
  updated_at: number;
}

export interface CoreReport {
  // ScoreType
  [key: string]: {
    [key: string]: ReportCheck;
  };
}

export interface ReportCheck {
  passed: boolean;
  exempt?: boolean;
  exemption_reason?: string;
  failed?: boolean;
  fail_reason?: string;
  value?: string | string[];
  url?: string;
  details?: string;
}

export interface FiltersSection {
  name: string;
  title: string;
  filters: Filter[];
}

export type MaturityFilters = {
  [key in Foundation]?: FiltersSection;
};

export interface Filter {
  name: string;
  label: string;
  legend?: string;
  decorator?: JSX.Element;
}

export interface Issue {
  level: number;
  description: string;
}

export interface Prefs {
  search: { limit: number; sort: { by: SortBy; direction: SortDirection } };
  theme: ThemePrefs;
}

export interface ThemePrefs {
  configured: string;
  effective: string;
}

export interface ReportOptionData {
  icon: JSX.Element;
  name: string;
  shortName?: string;
  legend: JSX.Element;
  reference?: string;
}

export enum Rating {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
}

export enum FilterKind {
  Foundation = 'foundation',
  Maturity = 'maturity',
  Rating = 'rating',
  PassingCheck = 'passing_check',
  NotPassingCheck = 'not_passing_check',
}

export enum ScoreType {
  BestPractices = 'best_practices',
  Documentation = 'documentation',
  Global = 'global',
  Legal = 'legal',
  License = 'license',
  Security = 'security',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  Name = 'name',
  Score = 'score',
}

export enum ReportOption {
  Adopters = 'adopters',
  Analytics = 'analytics',
  ApprovedLicense = 'license_approved',
  ArtifactHubBadge = 'artifacthub_badge',
  BinaryArtifacts = 'binary_artifacts',
  Changelog = 'changelog',
  CLA = 'cla',
  CodeOfConduct = 'code_of_conduct',
  CodeReview = 'code_review',
  CommunityMeeting = 'community_meeting',
  Contributing = 'contributing',
  DangerousWorkflow = 'dangerous_workflow',
  DependenciesPolicy = 'dependencies_policy',
  DependencyUpdateTool = 'dependency_update_tool',
  DCO = 'dco',
  GithubDiscussions = 'github_discussions',
  Governance = 'governance',
  LicenseScanning = 'license_scanning',
  Maintained = 'maintained',
  Maintainers = 'maintainers',
  OpenSSFBadge = 'openssf_badge',
  OpenSSFScorecardBadge = 'openssf_scorecard_badge',
  Readme = 'readme',
  RecentRelease = 'recent_release',
  Roadmap = 'roadmap',
  SBOM = 'sbom',
  SecurityInsights = 'security_insights',
  SecurityPolicy = 'security_policy',
  SignedReleases = 'signed_releases',
  SlackPresence = 'slack_presence',
  SPDX = 'license_spdx_id',
  SummaryTable = 'summary_table',
  TokenPermissions = 'token_permissions',
  TrademarkDisclaimer = 'trademark_disclaimer',
  Website = 'website',
}

export interface SearchFiltersURL extends BasicQuery {
  pageNumber: number;
}

export interface BasicQuery {
  text?: string;
  accepted_from?: string;
  accepted_to?: string;
  filters?: {
    [key: string]: string[];
  };
}

export interface SearchQuery extends BasicQuery {
  limit: number;
  offset: number;
  sort_by: SortBy;
  sort_direction: SortDirection;
}

export interface SearchData {
  limit: number;
  offset: number;
  sort_by: string;
  sort_direction: string;
  text?: string;
  accepted_from?: string;
  accepted_to?: string;
  maturity?: string[];
  rating?: number[];
  passing_check?: string[];
  not_passing_check?: string[];
}

export type Stats = {
  generated_at?: number;
  snapshots?: string[];
  projects: {
    running_total?: number[][];
    rating_distribution: {
      [key: string]: { [key: string]: number }[];
    };
    sections_average: {
      [key: string]: { [key in ScoreType]: number };
    };
    views_daily: number[][];
    views_monthly?: number[][];
    accepted_distribution: DistributionData[];
  };
  repositories: {
    passing_check: {
      [key in ScoreType]: {
        [key in ReportOption]?: number;
      };
    };
  };
};

export interface DistributionData {
  month: number;
  total: number;
  year: number;
}

export interface Error {
  kind: ErrorKind;
  message?: string;
}

export enum ErrorKind {
  Other,
  NotFound,
}

export enum RatingKind {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
}

export type ReportOptionInfo = {
  [key in ReportOption]: ReportOptionData;
};

export interface RecommendedTemplate {
  name: string;
  url: string;
}

export enum AcceptedRangeKind {
  To = 'accepted_to',
  From = 'accepted_from',
}

export type ChecksPerCategory = {
  [key in ScoreType]?: ReportOption[];
};

export interface Alert {
  type: 'success' | 'danger' | 'warning' | 'info';
  message: string;
  dismissOn?: number;
  autoClose?: boolean;
}

export interface SortOption {
  label: string;
  by: SortBy;
  direction: SortDirection;
}

export interface SortedDates {
  [key: string]: {
    [key: string]: string[];
  };
}
