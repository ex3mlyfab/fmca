import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusChip } from '@/pages/cms/departments';
import cmsNews from '@/routes/cms/news';
import cmsSeo from '@/routes/cms/seo';
import publicNews from '@/routes/news';

type CategoryOption = {
    id: number;
    name: string;
    slug: string;
};

type Post = {
    id?: number;
    title: string;
    slug: string;
    summary: string;
    body: string;
    category_id?: number | null;
    author: string;
    publish_date: string;
    owner?: string | null;
    reviewed_at?: string | null;
    status: string;
} | null;

type Props = {
    post: Post;
    categories: CategoryOption[];
};

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const selectClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

export default function NewsEditor({ post, categories }: Props) {
    const isEditing = Boolean(post?.id);

    return (
        <>
            <Head title={`${isEditing ? 'Edit' : 'New'} news | FMCA Content Studio`} />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href={cmsNews.index()}
                            as="button"
                            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold text-slate-600 transition-colors hover:bg-fmca-mist hover:text-fmca-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                        >
                            <ArrowLeft size={16} aria-hidden="true" />
                            News
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                            {post && <StatusChip status={post.status} />}
                            {post?.id && (
                                <Link
                                    href={cmsSeo.edit.url({ content_type: 'post', content_id: post.id })}
                                    as="button"
                                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-fmca-ink/15 bg-white px-3 text-sm font-bold text-fmca-ink transition-colors hover:bg-fmca-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fmca-sky"
                                >
                                    <Globe size={15} aria-hidden="true" />
                                    <span>SEO</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    <h1 className="mt-4 font-display text-3xl font-bold text-fmca-green-dark">
                        {isEditing ? 'Edit news item' : 'New news item'}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Fields marked * are required. Unpublished content is not shown on the public site.
                    </p>

                    <div className="mt-6 rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
                        <Form
                            method={isEditing ? 'put' : 'post'}
                            action={isEditing ? cmsNews.update.url(post!.id!) : cmsNews.store.url()}
                            resetOnError
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <div className="grid gap-5">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="title">
                                            Title <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="title" name="title" defaultValue={post?.title ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.title)} />
                                        {errors.title && <p className={fieldErrorClass}>{errors.title}</p>}
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="slug">
                                            URL slug <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="slug" name="slug" defaultValue={post?.slug ?? ''} maxLength={160} className="h-11" aria-invalid={Boolean(errors.slug)} />
                                        {errors.slug && <p className={fieldErrorClass}>{errors.slug}</p>}
                                        <p className="text-xs text-slate-500">Lowercase letters, numbers and hyphens only. Used in the public URL.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="summary">
                                            Short summary <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <Input id="summary" name="summary" defaultValue={post?.summary ?? ''} maxLength={240} className="h-11" aria-invalid={Boolean(errors.summary)} />
                                        {errors.summary && <p className={fieldErrorClass}>{errors.summary}</p>}
                                        <p className="text-xs text-slate-500">One or two sentences shown in the news list and on the public page.</p>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="category_id">Category</Label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            defaultValue={post?.category_id != null ? String(post.category_id) : ''}
                                            className={selectClass}
                                            aria-invalid={Boolean(errors.category_id)}
                                        >
                                            <option value="">No category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className={fieldErrorClass}>{errors.category_id}</p>}
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="author">
                                                Author <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <Input id="author" name="author" defaultValue={post?.author ?? ''} maxLength={120} className="h-11" aria-invalid={Boolean(errors.author)} />
                                            {errors.author && <p className={fieldErrorClass}>{errors.author}</p>}
                                            <p className="text-xs text-slate-500">Use the team or desk name, not a single clinician.</p>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="publish_date">
                                                Publish date <span className="text-fmca-crimson">*</span>
                                            </Label>
                                            <input
                                                id="publish_date"
                                                name="publish_date"
                                                type="date"
                                                defaultValue={post?.publish_date ?? ''}
                                                className={selectClass}
                                                aria-invalid={Boolean(errors.publish_date)}
                                            />
                                            {errors.publish_date && <p className={fieldErrorClass}>{errors.publish_date}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="body">
                                            Full text <span className="text-fmca-crimson">*</span>
                                        </Label>
                                        <textarea
                                            id="body"
                                            name="body"
                                            defaultValue={post?.body ?? ''}
                                            rows={8}
                                            aria-invalid={Boolean(errors.body)}
                                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                                        />
                                        {errors.body && <p className={fieldErrorClass}>{errors.body}</p>}
                                        <p className="text-xs text-slate-500">Plain text with line breaks. Do not state fees, availability or clinical advice.</p>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">Content owner</Label>
                                            <Input id="owner" name="owner" defaultValue={post?.owner ?? ''} maxLength={120} className="h-11" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reviewed_at">Last reviewed date</Label>
                                            <input
                                                id="reviewed_at"
                                                name="reviewed_at"
                                                type="date"
                                                defaultValue={post?.reviewed_at ? String(post.reviewed_at).slice(0, 10) : ''}
                                                className={selectClass}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status">Publication status</Label>
                                        <select id="status" name="status" defaultValue={post?.status ?? 'draft'} className={selectClass} aria-invalid={Boolean(errors.status)}>
                                            <option value="draft">Draft (hidden from public site)</option>
                                            <option value="published">Published (visible publicly)</option>
                                        </select>
                                        {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 border-t border-fmca-ink/10 pt-5">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 bg-fmca-green px-6 font-bold text-white shadow-sm hover:bg-fmca-green-dark disabled:opacity-50"
                                        >
                                            {processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create news item'}
                                        </Button>
                                        {recentlySuccessful && (
                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green">
                                                <CheckCircle2 size={16} aria-hidden="true" />
                                                Saved successfully.
                                            </span>
                                        )}
                                        {isEditing && post?.status === 'published' && (
                                            <a
                                                href={publicNews.show.url(post.slug)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                                            >
                                                <span>Preview public page</span>
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
