import { Form, Head } from '@inertiajs/react';
import { ArrowUpRight, CheckCircle2, Clock3, FileClock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { home } from '@/routes';
import { store as storeHomepage } from '@/actions/App/Http/Controllers/Cms/HomepageController';

type Configuration = { status?: string; sections?: { hero?: { title?: string; summary?: string } } } | null;
type Props = { configuration: Configuration; sections: string[] };

export default function HomepageWorkspace({ configuration, sections }: Props) {
    const status = configuration?.status ?? 'draft';

    return (
        <><Head title="Homepage workspace" /><div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8"><div className="mx-auto max-w-6xl">
            <header className="flex flex-col gap-5 border-b border-fmca-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-fmca-green">FMCA CONTENT STUDIO</p><h1 className="mt-2 font-display text-3xl font-bold text-fmca-green-dark">Homepage workspace</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Manage the controlled Home template, approvals and publication readiness from one place.</p></div><a href={home.url()} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-fmca-green px-4 text-sm font-bold text-fmca-green hover:bg-white">Preview public home <ArrowUpRight size={16} /></a></header>
            <section className="mt-8 grid gap-4 sm:grid-cols-3"><StatusCard icon={Clock3} label="Publication state" value={status.replace('_', ' ')} /><StatusCard icon={ShieldCheck} label="Approval gate" value="Clinical review required" /><StatusCard icon={FileClock} label="Revision history" value="Ready for audit trail" /></section>
            <section className="mt-8 rounded-2xl border border-fmca-ink/10 bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-4"><div><h2 className="font-display text-xl font-bold text-fmca-green-dark">Hero campaign draft</h2><p className="mt-1 text-sm text-slate-500">Demo copy only. Owners must review before publication.</p></div><span className="hidden items-center gap-2 text-sm font-semibold text-fmca-green sm:flex"><CheckCircle2 size={17} /> Editable draft</span></div><Form {...storeHomepage.form()} className="mt-7 grid gap-5" resetOnError>{({ errors, processing, recentlySuccessful }) => <><div className="grid gap-2"><Label htmlFor="hero_title">Hero title</Label><Input id="hero_title" name="hero_title" defaultValue={configuration?.sections?.hero?.title ?? 'Care information you can trust'} aria-invalid={Boolean(errors.hero_title)} />{errors.hero_title && <p className="text-sm text-fmca-crimson">{errors.hero_title}</p>}</div><div className="grid gap-2"><Label htmlFor="hero_summary">Hero summary</Label><textarea id="hero_summary" name="hero_summary" defaultValue={configuration?.sections?.hero?.summary ?? 'Clear guidance for patients, families and referring teams at every step of the journey.'} rows={4} aria-invalid={Boolean(errors.hero_summary)} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky" />{errors.hero_summary && <p className="text-sm text-fmca-crimson">{errors.hero_summary}</p>}</div><div className="flex items-center gap-3"><button type="submit" disabled={processing} className="inline-flex min-h-12 items-center justify-center rounded-md bg-fmca-green px-5 font-bold text-white hover:bg-fmca-green-dark disabled:opacity-50">{processing ? 'Saving draft...' : 'Save draft'}</button>{recentlySuccessful && <span className="text-sm font-semibold text-fmca-green">Draft saved.</span>}</div></>}</Form></section>
            <section className="mt-8 overflow-hidden rounded-2xl border border-fmca-ink/10 bg-white"><div className="border-b border-fmca-ink/10 px-5 py-5 sm:px-7"><h2 className="font-display text-xl font-bold text-fmca-green-dark">Homepage sections</h2><p className="mt-1 text-sm text-slate-500">Controlled order from the approved Home template.</p></div><div className="divide-y divide-fmca-ink/10">{sections.map((section, index) => <div key={section} className="flex min-h-16 items-center gap-4 px-5 py-3 sm:px-7"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fmca-mist text-sm font-bold text-fmca-green">{index + 1}</span><span className="flex-1 font-semibold">{section}</span><span className="text-xs font-semibold text-slate-500">Draft · owner required</span><button type="button" className="min-h-12 min-w-12 rounded-md text-sm font-bold text-fmca-green hover:bg-fmca-mist" aria-label={`Edit ${section}`}>Edit</button></div>)}</div></section>
        </div></div></>
    );
}

function StatusCard({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
    return <Card className="border-0 bg-white p-5 shadow-none"><Icon className="text-fmca-teal" size={22} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-2 font-display text-xl font-bold capitalize">{value}</p></Card>;
}
