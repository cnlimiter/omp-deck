import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { ExternalLink, Plug } from "lucide-react";

/**
 * /integrations — stub for V1.5 MCP server management UI.
 *
 * V1 routines can already invoke MCP tools via the `agent` step's
 * `mcp_servers_allowed` field once the user has installed an MCP server
 * through the chat's `/mcp install` command. The dedicated install UI lands
 * in V1.5; this view documents the path in the meantime.
 *
 * See `omp-deck/docs/proposals/routines-v1-plan.md` §5 for the design.
 */
export function IntegrationsView() {
	const { t } = useTranslation();
	return (
		<Layout
			sidebar={
				<div className="p-3">
					<div className="meta mb-2">{t("Integrations")}</div>
					<div className="text-sm text-ink-3">
						{t("V1.5 will surface installed MCP servers and one-click Workspace setup.")}
					</div>
				</div>
			}
			main={
				<div className="flex h-full min-h-0 flex-col">
					<div className="flex h-11 shrink-0 items-center gap-2 border-b border-line bg-paper px-3">
						<div className="meta">{t("Integrations")}</div>
						<span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-2xs uppercase tracking-meta text-accent">
							V1.5
						</span>
					</div>
					<div className="flex flex-1 items-center justify-center px-6 py-8">
						<div className="max-w-2xl space-y-4">
							<div className="flex items-center gap-2">
								<Plug className="h-5 w-5 text-accent" />
								<h2 className="text-lg font-medium text-ink">{t("Coming in V1.5")}</h2>
							</div>
							<p className="text-sm text-ink-2">
								{t("The Integrations page will host one-click installs for the curated MCP server catalog —")}{" "}
								<a
									href="https://github.com/taylorwilsdon/google_workspace_mcp"
									target="_blank"
									rel="noreferrer"
									className="text-accent hover:underline"
								>
									Google Workspace
								</a>{" "}
								{t("(Gmail + Calendar + Drive + Docs + 8 more), Slack, GitHub, Linear, Notion, Discord. Per-tenant OAuth, automatic refresh, advertised-tools panel.")}
							</p>
							<p className="text-sm text-ink-2">
								<strong className="text-ink">{t("In V1:")}</strong>{" "}
								{t("install MCP servers from chat with")}{" "}
								<code className="paper-code px-1 py-0.5 text-xs">/mcp install &lt;url-or-smithery-id&gt;</code>{" "}
								{t("or")}{" "}
								<code className="paper-code px-1 py-0.5 text-xs">/mcp smithery-search &lt;query&gt;</code>
								{t(". Once installed, any routine's")} <code>agent</code>{" "}
								{t("step can use them via")}{" "}
								<code className="paper-code px-1 py-0.5 text-xs">mcp_servers_allowed: [...]</code>
								{t(".")}
							</p>
							<p className="text-sm text-ink-2">
								{t("The dedicated")} <code className="paper-code px-1 py-0.5 text-xs">mcp</code>{" "}
								{t("step type for deterministic tool calls also lands in V1.5 once the SDK bridge exposes a direct")}{" "}
								<code className="paper-code px-1 py-0.5 text-xs">callMcpTool()</code>{" "}
								{t("surface — the schema accepts the step spec today, only execution is deferred.")}
							</p>
							<div className="rounded border border-line bg-paper-2 p-3">
								<div className="meta mb-1.5">{t("Design doc")}</div>
								<a
									href="https://github.com/bjb2/omp-deck/blob/main/docs/proposals/routines-v1-plan.md#5-integrations-via-mcp-v15"
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1 text-sm text-accent hover:underline"
								>
									routines-v1-plan.md §5
									<ExternalLink className="h-3 w-3" />
								</a>
							</div>
						</div>
					</div>
				</div>
			}
			inspector={null}
			topBar={null}
		/>
	);
}
