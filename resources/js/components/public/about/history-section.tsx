import type { ResolvedSiteInfo } from '@/lib/site-info';

/**
 * Render editor-authored body copy: server-sanitised HTML when the CMS stored
 * markup, escaped plain text paragraphs otherwise. Mirrors the page block
 * renderer so both surfaces treat stored content the same way.
 */
function RichBody({ body }: { body: string }) {
    const text = body.trim();
    const isHtml = /^<[^>\s]/.test(text);

    if (isHtml) {
        // Stored HTML is sanitised server-side (App\Support\BlockContentSanitizer)
        // before it reaches the database; the editor's SafeLink extension keeps
        // link targets internal or http(s) on the way in as well.
        return <div className="fmca-prose max-w-[65ch]" dangerouslySetInnerHTML={{ __html: text }} />;
    }

    return (
        <div className="max-w-[65ch] space-y-3">
            {text
                .split('\n')
                .filter((line) => line.trim() !== '')
                .map((paragraph, index) => (
                    <p key={index} className="text-base leading-relaxed text-slate-700">
                        {paragraph}
                    </p>
                ))
            }
        </div>
    );
}

/**
 * The institute history: the approved narrative, the vision and mission, and an
 * optional milestone timeline. The whole section hides itself until the CMS
 * record has something to say, so an empty workspace never renders a blank page.
 */
export function HistorySection({ siteInfo }: { siteInfo: ResolvedSiteInfo }) {
    const { historyBody, historyMilestones, visionStatement, missionStatement } = siteInfo;
    const hasHistory = Boolean(historyBody && historyBody.trim() !== '');
    const hasStatements = Boolean(visionStatement) || Boolean(missionStatement);

    if (!hasHistory && historyMilestones.length === 0 && !hasStatements) {
        return null;
    }

    return (
        <section className="bg-fmca-mist px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="about-history-heading">
            <div className="mx-auto max-w-7xl">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Our history</p>
                <h2 id="about-history-heading" className="mt-2 font-display text-3xl font-bold text-fmca-green-dark sm:text-4xl">
                    Who we are
                </h2>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
                    <div>
                        {hasHistory && <RichBody body={historyBody ?? ''} />}
                    </div>

                    <div className="grid gap-5">
                        {visionStatement && (
                            <div className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Vision</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-700">{visionStatement}</p>
                            </div>
                        )}
                        {missionStatement && (
                            <div className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Mission</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-700">{missionStatement}</p>
                            </div>
                        )}
                    </div>
                </div>

                {historyMilestones.length > 0 && (
                    <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {historyMilestones.map((milestone, index) => (
                            <li
                                key={`${milestone.year ?? index} ${milestone.title ?? ''}`}
                                className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs"
                            >
                                {milestone.year && (
                                    <span className="font-display text-lg font-bold text-fmca-green">{milestone.year}</span>
                                )}
                                {milestone.title && <h3 className="mt-1 text-sm font-bold text-fmca-ink">{milestone.title}</h3>}
                                {milestone.body && (
                                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">{milestone.body}</p>
                                )}
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </section>
    );
}
