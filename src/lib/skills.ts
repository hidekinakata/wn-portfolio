/**
 * Lista de skills do curriculo. Os nomes proprios (LangChain, Python, ...) nao
 * sao traduzidos; apenas os rotulos de grupo vivem em `src/messages/*.json`
 * sob a chave `Skills.*`.
 */
export type SkillGroupKey =
  | "aiAutomation"
  | "backendFrontend"
  | "dataCloudDevops";

export interface SkillGroup {
  readonly key: SkillGroupKey;
  readonly items: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    key: "aiAutomation",
    items: [
      "LangChain",
      "LangGraph",
      "AI Agents",
      "RAG",
      "Azure AI Foundry",
      "OpenAI API",
      "Vector Databases",
      "LangSmith",
      "n8n",
      "RPA",
    ],
  },
  {
    key: "backendFrontend",
    items: [
      "C# (.NET Core)",
      "Entity Framework Core",
      "Python",
      "TypeScript",
      "Angular",
      "Node.js",
      "REST APIs",
    ],
  },
  {
    key: "dataCloudDevops",
    items: [
      "SQL Server (T-SQL)",
      "ETL Pipelines",
      "Power BI",
      "Docker",
      "Testing",
    ],
  },
];
