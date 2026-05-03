export type AgentModel = "haiku" | "sonnet";
export type TeamName =
  | "orchestrator"
  | "research"
  | "files"
  | "obsidian"
  | "code"
  | "scheduler"
  | "notifications"
  | "security"
  | "automation";

export interface Agent {
  id: string;
  name: string;
  team: TeamName;
  role: string;
  model: AgentModel;
  color: string;
  description: string;
}

export const TEAM_COLORS: Record<TeamName, string> = {
  orchestrator: "#f97316",
  research: "#6d28d9",
  files: "#92400e",
  obsidian: "#166534",
  code: "#0e7490",
  scheduler: "#0f766e",
  notifications: "#a16207",
  security: "#991b1b",
  automation: "#334155",
};

export const TEAM_LABELS: Record<TeamName, string> = {
  orchestrator: "Orchestrator",
  research: "Research",
  files: "Files",
  obsidian: "Obsidian",
  code: "Code",
  scheduler: "Scheduler",
  notifications: "Notifications",
  security: "Security",
  automation: "Automation",
};

export const AGENTS: Agent[] = [
  // Orchestrator
  {
    id: "miso",
    name: "Miso",
    team: "orchestrator",
    role: "Orchestrator",
    model: "sonnet",
    color: "#f97316",
    description:
      "The central orchestrator of the OpenClaw system. Coordinates all teams, interprets user intent, delegates tasks, and synthesizes results.",
  },

  // Research Team
  {
    id: "navier",
    name: "Navier",
    team: "research",
    role: "Lead",
    model: "sonnet",
    color: "#6d28d9",
    description:
      "Research team lead. Plans research strategies and synthesizes findings from sub-agents.",
  },
  {
    id: "bokeh",
    name: "Bokeh",
    team: "research",
    role: "Speed Scout",
    model: "haiku",
    color: "#6d28d9",
    description: "Fast initial web searches to map the landscape of a topic.",
  },
  {
    id: "fermat",
    name: "Fermat",
    team: "research",
    role: "Deep Diver",
    model: "haiku",
    color: "#6d28d9",
    description:
      "Thorough analysis of complex or technical sources found by scouts.",
  },
  {
    id: "aperture",
    name: "Aperture",
    team: "research",
    role: "Source Critic",
    model: "haiku",
    color: "#6d28d9",
    description: "Evaluates source credibility, recency, and relevance.",
  },
  {
    id: "flux",
    name: "Flux",
    team: "research",
    role: "Trend Spotter",
    model: "haiku",
    color: "#6d28d9",
    description: "Identifies patterns, shifts, and emerging trends in data.",
  },
  {
    id: "refract",
    name: "Refract",
    team: "research",
    role: "Relevance Judge",
    model: "haiku",
    color: "#6d28d9",
    description: "Filters and ranks information by relevance to the query.",
  },
  {
    id: "quill",
    name: "Quill",
    team: "research",
    role: "Summary Writer",
    model: "haiku",
    color: "#6d28d9",
    description:
      "Writes concise, well-structured summaries from research outputs.",
  },

  // Files Team
  {
    id: "grynk",
    name: "Grynk",
    team: "files",
    role: "Storage Lead",
    model: "sonnet",
    color: "#92400e",
    description:
      "Files team lead. Oversees filesystem operations, coordinates cleanup and organization.",
  },
  {
    id: "plonk",
    name: "Plonk",
    team: "files",
    role: "Duplicate Hunter",
    model: "haiku",
    color: "#92400e",
    description: "Scans for and removes duplicate files across directories.",
  },
  {
    id: "rivet",
    name: "Rivet",
    team: "files",
    role: "Large File Scanner",
    model: "haiku",
    color: "#92400e",
    description: "Identifies oversized files and flags them for review.",
  },
  {
    id: "bracket",
    name: "Bracket",
    team: "files",
    role: "Organizer",
    model: "haiku",
    color: "#92400e",
    description: "Sorts and restructures file hierarchies per user conventions.",
  },
  {
    id: "slag",
    name: "Slag",
    team: "files",
    role: "Archiver",
    model: "haiku",
    color: "#92400e",
    description: "Compresses and archives old or infrequently accessed files.",
  },
  {
    id: "shear",
    name: "Shear",
    team: "files",
    role: "Safety Guard",
    model: "haiku",
    color: "#92400e",
    description:
      "Reviews proposed deletions and prevents accidental data loss.",
  },
  {
    id: "ledger",
    name: "Ledger",
    team: "files",
    role: "Report Writer",
    model: "haiku",
    color: "#92400e",
    description: "Generates structured reports of file operations performed.",
  },

  // Obsidian Team
  {
    id: "spore",
    name: "Spore",
    team: "obsidian",
    role: "Vault Lead",
    model: "sonnet",
    color: "#166534",
    description:
      "Obsidian team lead. Manages vault structure and coordinates note operations.",
  },
  {
    id: "slate",
    name: "Slate",
    team: "obsidian",
    role: "Note Creator",
    model: "haiku",
    color: "#166534",
    description: "Drafts and writes new notes in the Obsidian vault.",
  },
  {
    id: "lichen",
    name: "Lichen",
    team: "obsidian",
    role: "Linker",
    model: "haiku",
    color: "#166534",
    description: "Creates and maintains [[wikilinks]] between related notes.",
  },
  {
    id: "ochre",
    name: "Ochre",
    team: "obsidian",
    role: "Tagger",
    model: "haiku",
    color: "#166534",
    description: "Applies consistent tags and metadata to vault notes.",
  },
  {
    id: "pumice",
    name: "Pumice",
    team: "obsidian",
    role: "Cleaner",
    model: "haiku",
    color: "#166534",
    description:
      "Removes stale notes, broken links, and redundant content from the vault.",
  },
  {
    id: "flint",
    name: "Flint",
    team: "obsidian",
    role: "Coherence Checker",
    model: "haiku",
    color: "#166534",
    description:
      "Verifies factual consistency and logical flow across linked notes.",
  },

  // Code Team
  {
    id: "cache",
    name: "Cache",
    team: "code",
    role: "Architect",
    model: "sonnet",
    color: "#0e7490",
    description:
      "Code team lead and architect. Designs system structure and reviews implementation plans.",
  },
  {
    id: "wafer",
    name: "Wafer",
    team: "code",
    role: "Coder: Correctness",
    model: "sonnet",
    color: "#0e7490",
    description: "Writes code focused on correctness, edge cases, and logic.",
  },
  {
    id: "shader",
    name: "Shader",
    team: "code",
    role: "Coder: Performance",
    model: "sonnet",
    color: "#0e7490",
    description:
      "Optimizes code for speed, memory usage, and runtime efficiency.",
  },
  {
    id: "solder",
    name: "Solder",
    team: "code",
    role: "Coder: Robustness",
    model: "sonnet",
    color: "#0e7490",
    description:
      "Hardens code with error handling, retries, and defensive patterns.",
  },
  {
    id: "die",
    name: "Die",
    team: "code",
    role: "Bug Finder",
    model: "sonnet",
    color: "#0e7490",
    description: "Specialized in finding bugs, logic errors, and failure modes.",
  },
  {
    id: "temper",
    name: "Temper",
    team: "code",
    role: "Reviewer",
    model: "sonnet",
    color: "#0e7490",
    description:
      "Provides thorough code reviews focused on maintainability and best practices.",
  },
  {
    id: "ping",
    name: "Ping",
    team: "code",
    role: "Tester",
    model: "haiku",
    color: "#0e7490",
    description: "Generates unit tests and integration test scenarios.",
  },
  {
    id: "codex",
    name: "Codex",
    team: "code",
    role: "DocBot",
    model: "haiku",
    color: "#0e7490",
    description:
      "Writes inline documentation, docstrings, and README sections.",
  },

  // Scheduler Team
  {
    id: "verge",
    name: "Verge",
    team: "scheduler",
    role: "Schedule Lead",
    model: "haiku",
    color: "#0f766e",
    description:
      "Scheduler team lead. Manages the overall schedule and coordinates timing agents.",
  },
  {
    id: "escapement",
    name: "Escapement",
    team: "scheduler",
    role: "Cron Builder",
    model: "haiku",
    color: "#0f766e",
    description: "Translates natural language schedules into cron expressions.",
  },
  {
    id: "tick",
    name: "Tick",
    team: "scheduler",
    role: "Reminder Setter",
    model: "haiku",
    color: "#0f766e",
    description: "Creates and tracks one-shot and recurring reminders.",
  },
  {
    id: "deadlock",
    name: "Deadlock",
    team: "scheduler",
    role: "Conflict Detector",
    model: "haiku",
    color: "#0f766e",
    description:
      "Identifies scheduling conflicts and resource contention issues.",
  },

  // Notifications Team
  {
    id: "volta",
    name: "Volta",
    team: "notifications",
    role: "Priority Filter",
    model: "haiku",
    color: "#a16207",
    description:
      "Filters incoming signals by priority and routes them appropriately.",
  },
  {
    id: "dawn",
    name: "Dawn",
    team: "notifications",
    role: "Morning Briefer",
    model: "haiku",
    color: "#a16207",
    description: "Compiles and delivers daily morning briefings to the user.",
  },
  {
    id: "hertz",
    name: "Hertz",
    team: "notifications",
    role: "Stock Watcher",
    model: "haiku",
    color: "#a16207",
    description:
      "Monitors stock prices and financial data for configured alerts.",
  },
  {
    id: "pulse",
    name: "Pulse",
    team: "notifications",
    role: "News Aggregator",
    model: "haiku",
    color: "#a16207",
    description: "Aggregates news from multiple sources based on user topics.",
  },
  {
    id: "flare",
    name: "Flare",
    team: "notifications",
    role: "Alert Sender",
    model: "haiku",
    color: "#a16207",
    description:
      "Delivers urgent notifications via configured channels (email, SMS, etc.).",
  },

  // Security Team
  {
    id: "latch",
    name: "Latch",
    team: "security",
    role: "Security Lead",
    model: "sonnet",
    color: "#991b1b",
    description:
      "Security team lead. Oversees permission management and threat assessment.",
  },
  {
    id: "keyway",
    name: "Keyway",
    team: "security",
    role: "Permission Checker",
    model: "haiku",
    color: "#991b1b",
    description:
      "Validates that agent actions stay within authorized permission boundaries.",
  },
  {
    id: "shroud",
    name: "Shroud",
    team: "security",
    role: "Sensitive Data Scanner",
    model: "haiku",
    color: "#991b1b",
    description: "Detects and flags PII, credentials, and sensitive content.",
  },
  {
    id: "char",
    name: "Char",
    team: "security",
    role: "Threat Assessor",
    model: "haiku",
    color: "#991b1b",
    description:
      "Evaluates risk levels of proposed operations before execution.",
  },

  // Automation Team
  {
    id: "sprocket",
    name: "Sprocket",
    team: "automation",
    role: "Automation Lead",
    model: "haiku",
    color: "#334155",
    description:
      "Automation team lead. Designs and oversees batch and workflow automation.",
  },
  {
    id: "cinder",
    name: "Cinder",
    team: "automation",
    role: "Batch Processor",
    model: "haiku",
    color: "#334155",
    description:
      "Executes large batch operations efficiently across many files or records.",
  },
  {
    id: "cam",
    name: "Cam",
    team: "automation",
    role: "Loop Runner",
    model: "haiku",
    color: "#334155",
    description:
      "Manages iterative loops and retry logic in automation pipelines.",
  },
  {
    id: "ratchet",
    name: "Ratchet",
    team: "automation",
    role: "Completion Logger",
    model: "haiku",
    color: "#334155",
    description:
      "Records completion status and metrics for all automated tasks.",
  },
];

export const getAgentsByTeam = (team: TeamName): Agent[] =>
  AGENTS.filter((a) => a.team === team);

export const getAgent = (id: string): Agent | undefined =>
  AGENTS.find((a) => a.id === id);

export const TEAMS: TeamName[] = [
  "research",
  "files",
  "obsidian",
  "code",
  "scheduler",
  "notifications",
  "security",
  "automation",
];
