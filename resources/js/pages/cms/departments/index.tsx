import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Building2, CheckCircle2, Clock3, Inbox, PencilLine, Plus } from 'lucide-react';
import cmsDepartments from '@/routes/cms/departments';
import publicDepartments from '@/routes/departments';

type Department = {
    id: number;
    name: string;
    slug: string;
    summary: string;
    status: string;
};

type Props = {
    departments: Department[];
    canCreate: boolean;
};

export default function DepartmentsIndex({ departments, canCreate }: Props) {
    return (
        <>
            <Head title="Departments | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Clinical Directory</p>
                            <h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Departments</h1>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Manage the clinical department directory shown on the public site.
                            </p>
                        </div>
                        {canCreate && (
                            <Link
                                href={cmsDepartments.create()}
                                as="button"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                            >
                                <Plus size={18} aria-hidden="true" />
                                New department
                            </Link>
                        )}
                    </header>

                    {departments.length === 0 ? (
                        <EmptyState canCreate={canCreate} />
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-xl border border-fmca-ink/10 bg-white shadow-xs">
                            {departments.map((department) => (
                                <div
                                    key={department.id}
                                    className="flex flex-col gap-3 border-b border-fmca-ink/10 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <Building2 className="mt-0.5 shrink-0 text-fmca-teal" size={20} aria-hidden="true" />
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-display text-base font-bold text-fmca-green-dark">{department.name}</h2>
                                                <StatusChip status={department.status} />
                                            </div>
                                            <p className="mt-1 truncate text-sm text-slate-600">{department.summary}</p>
                                            <p className="mt-0.5 text-xs text-slate-400">/{department.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        {department.status === 'published' && (
                                            <a
                                                href={publicDepartments.show.url(department.slug)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-bold text-fmca-green transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                            >
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                                <span>View</span>
                                            </a>
                                        )}
                                        <Link
                                            href={cmsDepartments.edit(department.id)}
                                            as="button"
                                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                        >
                                            <PencilLine size={15} aria-hidden="true" />
                                            <span>Edit</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
    return (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-fmca-ink/20 bg-white p-12 text-center shadow-xs">
            <Inbox className="text-slate-400" size={32} aria-hidden="true" />
            <div>
                <h2 className="font-display text-lg font-bold text-fmca-green-dark">No departments yet</h2>
                <p className="mt-1 max-w-md text-sm text-slate-600">
                    Departments you create will appear in this list and on the public directory.
                </p>
            </div>
            {canCreate && (
                <Link
                    href={cmsDepartments.create()}
                    as="button"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fmca-green px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky"
                >
                    <Plus size={18} aria-hidden="true" />
                    Create your first department
                </Link>
            )}
        </div>
    );
}

export function StatusChip({ status }: { status: string }) {
    if (status === 'published') {
        return (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={13} aria-hidden="true" />
                Published
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
            <Clock3 size={13} aria-hidden="true" />
            Draft
        </span>
    );
}
