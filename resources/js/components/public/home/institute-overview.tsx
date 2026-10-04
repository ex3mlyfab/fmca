import { ArrowRight, Eye, Landmark, Target, UserRound } from 'lucide-react';

export type InstituteOverviewProps = {
    eyebrow?: string;
    heading?: string;
    intro?: string;

    historyEyebrow?: string;
    historyHeading?: string;
    history?: string;
    visionHeading?: string;
    vision?: string;
    missionHeading?: string;
    mission?: string;

    leadershipEyebrow?: string;
    leadName?: string;
    leadRole?: string;
    leadMessage?: string;
    leadPortrait?: string | null;
    leadPortraitAlt?: string;
    leadershipLinkHref?: string;
    leadershipLinkLabel?: string;
};

/**
 * Institutional narrative next to the sitting Medical Director.
 *
 * Copy is prop-overridable so Corporate Communications can drop in the
 * approved history, purpose statements, and named office-holder without
 * touching markup. Defaults deliberately carry no invented personal name,
 * term of office, date, or statistic (see PROJECT_PLAN.md).
 */
export function InstituteOverview({
    eyebrow = 'Institutional Profile',
    heading = 'Our story and the people who lead it',
    intro = 'A federal tertiary institution, its purpose, and the office that stewards it.',
    historyEyebrow = 'Institutional Legacy',
    historyHeading = 'History',
    history = 'Federal Medical Centre, Abuja carries a federal tertiary mandate: advanced referral-level clinical care, postgraduate medical training, and the public-health leadership the capital region depends on.',
    visionHeading = 'Vision',
    vision = 'To be a trusted centre of clinical excellence where advanced care, research, and postgraduate training set the national standard.',
    missionHeading = 'Mission',
    mission = 'To deliver safe, high-quality tertiary medical care and train the next generation of specialist clinicians.',
    leadershipEyebrow = 'Hospital Leadership',
    leadName = 'Medical Director',
    leadRole = '',
    leadMessage = 'Clinical governance, continuity of care, and the accountability of this institution sit with the medical leadership of FMCA Abuja.',
    leadPortrait = null,
    leadPortraitAlt = 'Portrait of the Medical Director',
    leadershipLinkHref = '/about/leadership',
    leadershipLinkLabel = 'Meet the top management committee',
}: InstituteOverviewProps) {
    return (
        <section id="overview" className="bg-fmca-mist px-4 py-14 sm:px-6 lg:py-20" aria-labelledby="overview-heading">
            <div className="mx-auto max-w-7xl">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-fmca-green">
                        <Landmark size={15} aria-hidden="true" />
                        <span>{eyebrow}</span>
                    </div>
                    <h2 id="overview-heading" className="mt-3 font-display text-2xl font-bold text-fmca-green-dark sm:text-3xl lg:text-4xl">
                        {heading}
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                        {intro}
                    </p>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
                    <article className="flex flex-col rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                            <Eye size={16} aria-hidden="true" />
                            <span>{historyEyebrow}</span>
                        </div>
                        <h3 className="mt-4 font-display text-xl font-bold text-fmca-green-dark">
                            {historyHeading}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {history}
                        </p>

                        <div className="mt-6 space-y-5 border-t border-fmca-ink/10 pt-6">
                            <div className="flex gap-4">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green">
                                    <Eye size={20} aria-hidden="true" />
                                </span>
                                <div>
                                    <h4 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-fmca-green-dark">
                                        {visionHeading}
                                    </h4>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                        {vision}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green">
                                    <Target size={20} aria-hidden="true" />
                                </span>
                                <div>
                                    <h4 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-fmca-green-dark">
                                        {missionHeading}
                                    </h4>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                        {mission}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </article>

                    <article className="flex flex-col rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">
                            <UserRound size={16} aria-hidden="true" />
                            <span>{leadershipEyebrow}</span>
                        </div>

                        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-fmca-ink/10 bg-fmca-mist text-fmca-green">
                                {leadPortrait ? (
                                    <img
                                        src={leadPortrait}
                                        alt={leadPortraitAlt}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserRound size={32} aria-hidden="true" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <h3 id="overview-lead-name" className="font-display text-2xl font-bold leading-tight text-fmca-green-dark">
                                    {leadName}
                                </h3>
                                {leadRole && (
                                    <p className="mt-1 text-sm font-semibold text-slate-600">
                                        {leadRole}
                                    </p>
                                )}
                                {!leadPortrait && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Portrait to be confirmed
                                    </p>
                                )}
                            </div>
                        </div>

                        {leadMessage && (
                            <blockquote className="mt-6 border-l-2 border-fmca-green/30 pl-4">
                                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                                    {leadMessage}
                                </p>
                            </blockquote>
                        )}

                        <a
                            href={leadershipLinkHref}
                            className="mt-auto inline-flex min-h-12 items-center gap-2 rounded-md pt-6 text-sm font-bold text-fmca-green transition-colors hover:text-fmca-green-dark focus-visible:ring-2 focus-visible:ring-fmca-sky focus-visible:ring-offset-2"
                        >
                            <span>{leadershipLinkLabel}</span>
                            <ArrowRight size={16} aria-hidden="true" />
                        </a>
                    </article>
                </div>
            </div>
        </section>
    );
}
