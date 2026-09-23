import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import { home } from '@/routes';
import cmsSiteMenu from '@/routes/cms/site-menu';

type MenuItem = {
    id?: number;
    label: string;
    href: string;
    sort_order?: number | null;
    owner?: string | null;
    reviewed_at?: string | null;
    status: string;
} | null;

type Props = {
    item: MenuItem;
    canPublish: boolean;
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function SiteMenuItemEditor({ item, canPublish }: Props) {
    const isEditing = Boolean(item?.id);
    const canSetStatus = canPublish || item?.status === 'published';

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} menu item | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsSiteMenu.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            Site Menu
                        </Link>
                        {item && <StatusChip status={item.status} />}
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit menu item' : 'New menu item'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Items are public only after they are approved and published.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsSiteMenu.update.url(item!.id!) : cmsSiteMenu.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="label">
                                            Menu label <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input
                                            id="label"
                                            name="label"
                                            defaultValue={item?.label ?? ''}
                                            maxLength={100}
                                            className="h-11"
                                            aria-invalid={Boolean(errors.label)}
                                        />
                                        {errors.label && <p className={fieldErrorClass}>{errors.label}</p>}
                                        <p className="text-xs text-slate-500">The text visitors see in the header and mobile menu.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="href">
                                            Destination <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input
                                            id="href"
                                            name="href"
                                            defaultValue={item?.href ?? ''}
                                            maxLength={2048}
                                            placeholder="/services"
                                            className="h-11"
                                            aria-invalid={Boolean(errors.href)}
                                        />
                                        {errors.href && <p className={fieldErrorClass}>{errors.href}</p>}
                                        <p className="text-xs text-slate-500">
                                            Start with a slash for an internal page, for example /services or /patients.
                                        </p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="sort_order">Sort order</Label>
                                            <Input
                                                id="sort_order"
                                                name="sort_order"
                                                type="number"
                                                min={0}
                                                defaultValue={item?.sort_order ?? 0}
                                                className="h-11"
                                                aria-invalid={Boolean(errors.sort_order)}
                                            />
                                            {errors.sort_order && <p className={fieldErrorClass}>{errors.sort_order}</p>}
                                            <p className="text-xs text-slate-500">Lower numbers appear first in the menu.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">Content owner</Label>
                                            <Input
                                                id="owner"
                                                name="owner"
                                                defaultValue={item?.owner ?? ''}
                                                maxLength={120}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reviewed_at">Last reviewed</Label>
                                            <Input
                                                id="reviewed_at"
                                                name="reviewed_at"
                                                type="date"
                                                defaultValue={item?.reviewed_at ?? ''}
                                                className="h-11"
                                                aria-invalid={Boolean(errors.reviewed_at)}
                                            />
                                            {errors.reviewed_at && <p className={fieldErrorClass}>{errors.reviewed_at}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="item-status">Publication status</Label>
                                        <select
                                            id="item-status"
                                            name="status"
                                            defaultValue={item?.status ?? 'draft'}
                                            aria-invalid={Boolean(errors.status)}
                                            className={selectClass}
                                        >
                                            <option value="draft">Draft (hidden from public site)</option>
                                            {canSetStatus && <option value="published">Published (visible publicly)</option>}
                                        </select>
                                        {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create menu item'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} aria-hidden="true" />
                                                Saved successfully.
                                            </span>
                                        )}
                                        {isEditing && (
                                            <a
                                                href={home().url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                                            >
                                                <span>View public header</span>
                                                <ArrowUpRight size={15} aria-hidden="true" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
