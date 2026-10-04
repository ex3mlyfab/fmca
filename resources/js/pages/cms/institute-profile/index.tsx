import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { StatusChip } from '@/pages/cms/departments';
import cmsInstituteProfile from '@/routes/cms/institute-profile';

type ProfilePayload = {
    institutionName: string | null;
    aboutIntro: string | null;
    historyBody: string | null;
    historyMilestones: { year: string | null; title: string | null; body: string | null }[];
    visionStatement: string | null;
    missionStatement: string | null;
    generalEmail: string | null;
    generalPhone: string | null;
    generalPhoneLabel: string | null;
    emergencyPhone: string | null;
    emergencyLabel: string | null;
    campusName: string | null;
    addressLines: string[];
    accessNote: string | null;
    locationLabel: string | null;
    locationAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    mapZoom: number | null;
    directionsUrl: string | null;
    mapEmbedUrl: string | null;
    mapAltText: string | null;
    visitingHours: { dayRange: string; morningSlot: string; eveningSlot: string; status: string }[];
    visitingPolicyNote: string | null;
    owner: string | null;
    reviewedAt: string | null;
    reviewedAtLabel: string | null;
    status: 'draft' | 'published';
};

type Props = {
    profile: ProfilePayload | null;
    maxMilestones: number;
    maxAddressLines: number;
    maxVisitingSlots: number;
    canPublish: boolean;
};

type MilestoneDraft = { year: string; title: string; body: string };

type HourDraft = { dayRange: string; morningSlot: string; eveningSlot: string; status: string };

type ProfileDraft = {
    institutionName: string;
    aboutIntro: string;
    historyBody: string;
    historyMilestones: MilestoneDraft[];
    visionStatement: string;
    missionStatement: string;
    generalEmail: string;
    generalPhone: string;
    generalPhoneLabel: string;
    emergencyPhone: string;
    emergencyLabel: string;
    campusName: string;
    addressLines: string[];
    accessNote: string;
    locationLabel: string;
    locationAddress: string;
    latitude: string;
    longitude: string;
    mapZoom: string;
    directionsUrl: string;
    mapEmbedUrl: string;
    mapAltText: string;
    visitingHours: HourDraft[];
    visitingPolicyNote: string;
    owner: string;
    reviewedAt: string;
    status: 'draft' | 'published';
};

const EMPTY_MILESTONE: MilestoneDraft = { year: '', title: '', body: '' };

const EMPTY_HOUR: HourDraft = { dayRange: '', morningSlot: '', eveningSlot: '', status: '' };

function toDraft(profile: ProfilePayload | null): ProfileDraft {
    if (profile === null) {
        return {
            institutionName: '',
            aboutIntro: '',
            historyBody: '',
            historyMilestones: [],
            visionStatement: '',
            missionStatement: '',
            generalEmail: '',
            generalPhone: '',
            generalPhoneLabel: '',
            emergencyPhone: '',
            emergencyLabel: '',
            campusName: '',
            addressLines: [''],
            accessNote: '',
            locationLabel: '',
            locationAddress: '',
            latitude: '',
            longitude: '',
            mapZoom: '16',
            directionsUrl: '',
            mapEmbedUrl: '',
            mapAltText: '',
            visitingHours: [],
            visitingPolicyNote: '',
            owner: '',
            reviewedAt: '',
            status: 'draft',
        };
    }

    return {
        institutionName: profile.institutionName ?? '',
        aboutIntro: profile.aboutIntro ?? '',
        historyBody: profile.historyBody ?? '',
        historyMilestones: (profile.historyMilestones ?? []).map((milestone) => ({
            year: milestone.year ?? '',
            title: milestone.title ?? '',
            body: milestone.body ?? '',
        })),
        visionStatement: profile.visionStatement ?? '',
        missionStatement: profile.missionStatement ?? '',
        generalEmail: profile.generalEmail ?? '',
        generalPhone: profile.generalPhone ?? '',
        generalPhoneLabel: profile.generalPhoneLabel ?? '',
        emergencyPhone: profile.emergencyPhone ?? '',
        emergencyLabel: profile.emergencyLabel ?? '',
        campusName: profile.campusName ?? '',
        addressLines: profile.addressLines.length > 0 ? [...profile.addressLines] : [''],
        accessNote: profile.accessNote ?? '',
        locationLabel: profile.locationLabel ?? '',
        locationAddress: profile.locationAddress ?? '',
        latitude: profile.latitude === null ? '' : String(profile.latitude),
        longitude: profile.longitude === null ? '' : String(profile.longitude),
        mapZoom: profile.mapZoom === null ? '' : String(profile.mapZoom),
        directionsUrl: profile.directionsUrl ?? '',
        mapEmbedUrl: profile.mapEmbedUrl ?? '',
        mapAltText: profile.mapAltText ?? '',
        visitingHours: (profile.visitingHours ?? []).map((slot) => ({
            dayRange: slot.dayRange,
            morningSlot: slot.morningSlot,
            eveningSlot: slot.eveningSlot,
            status: slot.status,
        })),
        visitingPolicyNote: profile.visitingPolicyNote ?? '',
        owner: profile.owner ?? '',
        reviewedAt: profile.reviewedAt ?? '',
        status: profile.status,
    };
}

const fieldErrorClass = 'text-xs font-medium text-fmca-crimson';
const inputClass =
    'h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';
const textareaClass =
    'w-full rounded-md border border-input bg-white px-3 py-2 text-sm leading-relaxed text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40';

function err(errors: Record<string, string> | undefined, key: string): string {
    return errors?.[key] ?? '';
}

function PageCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-fmca-ink/10 bg-white p-6 shadow-xs sm:p-8">
            <h2 className="font-display text-lg font-bold text-fmca-green-dark">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{hint}</p>
            <div className="mt-6 grid gap-5">{children}</div>
        </section>
    );
}

export default function InstituteProfileIndex({ profile, maxMilestones, maxAddressLines, maxVisitingSlots, canPublish }: Props) {
    const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(profile));

    const status = draft.status;
    // A non-publisher can still hold a published profile published while
    // editing, or pull it back to draft; they cannot promote a draft.
    const showPublishedOption = canPublish || draft.status === 'published';
    const statusOptions = showPublishedOption ? (['draft', 'published'] as const) : (['draft'] as const);

    return (
        <>
            <Head title="About & Contact | FMCA Content Studio" />
            <div className="min-h-screen bg-[#f5f8f6] p-4 text-fmca-ink sm:p-8">
                <div className="mx-auto max-w-5xl">
                    <header>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-fmca-green">Content Studio | Site Configuration</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h1 className="font-display text-3xl font-bold text-fmca-green-dark">About &amp; Contact</h1>
                            <StatusChip status={status} />
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                            Institute history, contact details and campus directions for the public about page. The emergency
                            line, address and visiting hours here are also the values every other public page shows, so change
                            them once and they update everywhere.
                        </p>
                        {!canPublish && (
                            <p className="mt-4 rounded-xl border border-fmca-ink/10 bg-white p-4 text-sm text-slate-600 shadow-xs">
                                You can edit the about page, but publishing needs the <span className="font-semibold text-fmca-ink">institute profile publishing</span> right.
                            </p>
                        )}
                    </header>

                    <Form method="put" action={cmsInstituteProfile.update.url()} resetOnError className="mt-8">
                        {({ errors, processing, recentlySuccessful }) => (
                            <div className="grid gap-6">
                                {recentlySuccessful && (
                                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                        <CheckCircle2 size={18} aria-hidden="true" />
                                        <span>Saved. The public site now shows this version.</span>
                                    </div>
                                )}

                                <PageCard title="Institute & history" hint="Plain text for the opening line, rich text for the history narrative.">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="institution_name">Institution name</Label>
                                        <Input id="institution_name" name="institution_name" value={draft.institutionName} onChange={(e) => setDraft((d) => ({ ...d, institutionName: e.target.value }))} maxLength={160} className={inputClass} aria-invalid={Boolean(err(errors, 'institution_name'))} />
                                        {err(errors, 'institution_name') && <p className={fieldErrorClass}>{err(errors, 'institution_name')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="about_intro">Opening line</Label>
                                        <textarea id="about_intro" name="about_intro" value={draft.aboutIntro} onChange={(e) => setDraft((d) => ({ ...d, aboutIntro: e.target.value }))} maxLength={1000} rows={3} aria-invalid={Boolean(err(errors, 'about_intro'))} className={textareaClass} />
                                        {err(errors, 'about_intro') && <p className={fieldErrorClass}>{err(errors, 'about_intro')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label>History narrative</Label>
                                        <RichTextEditor value={draft.historyBody} onContentChange={(html) => setDraft((d) => ({ ...d, historyBody: html }))} label="History narrative" placeholder="Write the institute history here." />
                                        <input type="hidden" name="history_body" value={draft.historyBody} />
                                        {err(errors, 'history_body') && <p className={fieldErrorClass}>{err(errors, 'history_body')}</p>}
                                    </div>
                                    <MilestoneEditor milestones={draft.historyMilestones} max={maxMilestones} onAdd={() => setDraft((d) => ({ ...d, historyMilestones: [...d.historyMilestones, { ...EMPTY_MILESTONE }] }))} onChange={(index, field, value) => setDraft((d) => ({ ...d, historyMilestones: d.historyMilestones.map((m, i) => (i === index ? { ...m, [field]: value } : m)) }))} onRemove={(index) => setDraft((d) => ({ ...d, historyMilestones: d.historyMilestones.filter((_, i) => i !== index) }))} error={err(errors, 'history_milestones')} />
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="vision_statement">Vision</Label>
                                        <textarea id="vision_statement" name="vision_statement" value={draft.visionStatement} onChange={(e) => setDraft((d) => ({ ...d, visionStatement: e.target.value }))} maxLength={1000} rows={3} aria-invalid={Boolean(err(errors, 'vision_statement'))} className={textareaClass} />
                                        {err(errors, 'vision_statement') && <p className={fieldErrorClass}>{err(errors, 'vision_statement')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="mission_statement">Mission</Label>
                                        <textarea id="mission_statement" name="mission_statement" value={draft.missionStatement} onChange={(e) => setDraft((d) => ({ ...d, missionStatement: e.target.value }))} maxLength={1000} rows={3} aria-invalid={Boolean(err(errors, 'mission_statement'))} className={textareaClass} />
                                        {err(errors, 'mission_statement') && <p className={fieldErrorClass}>{err(errors, 'mission_statement')}</p>}
                                    </div>
                                </PageCard>

                                <PageCard title="Contact" hint="The emergency line here replaces the number on every public page, including the header, footer and contact page.">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="general_email">General email</Label>
                                        <Input id="general_email" name="general_email" type="email" value={draft.generalEmail} onChange={(e) => setDraft((d) => ({ ...d, generalEmail: e.target.value }))} maxLength={190} className={inputClass} aria-invalid={Boolean(err(errors, 'general_email'))} />
                                        {err(errors, 'general_email') && <p className={fieldErrorClass}>{err(errors, 'general_email')}</p>}
                                    </div>
                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="general_phone">General phone</Label>
                                            <Input id="general_phone" name="general_phone" value={draft.generalPhone} onChange={(e) => setDraft((d) => ({ ...d, generalPhone: e.target.value }))} maxLength={32} className={inputClass} aria-invalid={Boolean(err(errors, 'general_phone'))} />
                                            {err(errors, 'general_phone') && <p className={fieldErrorClass}>{err(errors, 'general_phone')}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="general_phone_label">Phone label</Label>
                                            <Input id="general_phone_label" name="general_phone_label" value={draft.generalPhoneLabel} onChange={(e) => setDraft((d) => ({ ...d, generalPhoneLabel: e.target.value }))} maxLength={120} className={inputClass} aria-invalid={Boolean(err(errors, 'general_phone_label'))} />
                                            {err(errors, 'general_phone_label') && <p className={fieldErrorClass}>{err(errors, 'general_phone_label')}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="emergency_phone">Emergency line</Label>
                                            <Input id="emergency_phone" name="emergency_phone" value={draft.emergencyPhone} onChange={(e) => setDraft((d) => ({ ...d, emergencyPhone: e.target.value }))} maxLength={32} className={inputClass} aria-invalid={Boolean(err(errors, 'emergency_phone'))} />
                                            {err(errors, 'emergency_phone') && <p className={fieldErrorClass}>{err(errors, 'emergency_phone')}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="emergency_label">Emergency label</Label>
                                            <Input id="emergency_label" name="emergency_label" value={draft.emergencyLabel} onChange={(e) => setDraft((d) => ({ ...d, emergencyLabel: e.target.value }))} maxLength={120} className={inputClass} aria-invalid={Boolean(err(errors, 'emergency_label'))} />
                                            {err(errors, 'emergency_label') && <p className={fieldErrorClass}>{err(errors, 'emergency_label')}</p>}
                                        </div>
                                    </div>
                                </PageCard>

                                <PageCard title="Campus & map" hint="Coordinates enable the OpenStreetMap embed on the about page. Enter both, or neither.">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="campus_name">Campus name</Label>
                                        <Input id="campus_name" name="campus_name" value={draft.campusName} onChange={(e) => setDraft((d) => ({ ...d, campusName: e.target.value }))} maxLength={160} className={inputClass} aria-invalid={Boolean(err(errors, 'campus_name'))} />
                                        {err(errors, 'campus_name') && <p className={fieldErrorClass}>{err(errors, 'campus_name')}</p>}
                                    </div>
                                    <AddressEditor lines={draft.addressLines} max={maxAddressLines} onAdd={() => setDraft((d) => ({ ...d, addressLines: [...d.addressLines, ''] }))} onChange={(index, value) => setDraft((d) => ({ ...d, addressLines: d.addressLines.map((line, i) => (i === index ? value : line)) }))} onRemove={(index) => setDraft((d) => ({ ...d, addressLines: d.addressLines.filter((_, i) => i !== index) }))} error={err(errors, 'address_lines')} />
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="access_note">Access note</Label>
                                        <Input id="access_note" name="access_note" value={draft.accessNote} onChange={(e) => setDraft((d) => ({ ...d, accessNote: e.target.value }))} maxLength={240} className={inputClass} aria-invalid={Boolean(err(errors, 'access_note'))} />
                                        {err(errors, 'access_note') && <p className={fieldErrorClass}>{err(errors, 'access_note')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="location_label">Map location label</Label>
                                        <Input id="location_label" name="location_label" value={draft.locationLabel} onChange={(e) => setDraft((d) => ({ ...d, locationLabel: e.target.value }))} maxLength={160} className={inputClass} aria-invalid={Boolean(err(errors, 'location_label'))} />
                                        {err(errors, 'location_label') && <p className={fieldErrorClass}>{err(errors, 'location_label')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="location_address">Map location address</Label>
                                        <Input id="location_address" name="location_address" value={draft.locationAddress} onChange={(e) => setDraft((d) => ({ ...d, locationAddress: e.target.value }))} maxLength={240} className={inputClass} aria-invalid={Boolean(err(errors, 'location_address'))} />
                                        {err(errors, 'location_address') && <p className={fieldErrorClass}>{err(errors, 'location_address')}</p>}
                                    </div>
                                    <div className="grid gap-1.5 sm:grid-cols-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="latitude">Latitude</Label>
                                            <Input id="latitude" name="latitude" type="number" step="0.000001" min={-90} max={90} value={draft.latitude} onChange={(e) => setDraft((d) => ({ ...d, latitude: e.target.value }))} className={inputClass} aria-invalid={Boolean(err(errors, 'latitude'))} />
                                            {err(errors, 'latitude') && <p className={fieldErrorClass}>{err(errors, 'latitude')}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="longitude">Longitude</Label>
                                            <Input id="longitude" name="longitude" type="number" step="0.000001" min={-180} max={180} value={draft.longitude} onChange={(e) => setDraft((d) => ({ ...d, longitude: e.target.value }))} className={inputClass} aria-invalid={Boolean(err(errors, 'longitude'))} />
                                            {err(errors, 'longitude') && <p className={fieldErrorClass}>{err(errors, 'longitude')}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="map_zoom">Map zoom (3-19)</Label>
                                            <Input id="map_zoom" name="map_zoom" type="number" min={3} max={19} value={draft.mapZoom} onChange={(e) => setDraft((d) => ({ ...d, mapZoom: e.target.value }))} className={inputClass} aria-invalid={Boolean(err(errors, 'map_zoom'))} />
                                            {err(errors, 'map_zoom') && <p className={fieldErrorClass}>{err(errors, 'map_zoom')}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="directions_url">Directions URL</Label>
                                        <Input id="directions_url" name="directions_url" value={draft.directionsUrl} onChange={(e) => setDraft((d) => ({ ...d, directionsUrl: e.target.value }))} maxLength={512} placeholder="Internal path or http(s) URL" className={inputClass} aria-invalid={Boolean(err(errors, 'directions_url'))} />
                                        <p className="text-xs leading-relaxed text-slate-600">Blank falls back to the coordinates, then to a Google Maps search of the address.</p>
                                        {err(errors, 'directions_url') && <p className={fieldErrorClass}>{err(errors, 'directions_url')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="map_embed_url">Embed URL override</Label>
                                        <Input id="map_embed_url" name="map_embed_url" value={draft.mapEmbedUrl} onChange={(e) => setDraft((d) => ({ ...d, mapEmbedUrl: e.target.value }))} maxLength={512} placeholder="https://www.openstreetmap.org/export/embed.html?... or a Google Maps embed" className={inputClass} aria-invalid={Boolean(err(errors, 'map_embed_url'))} />
                                        <p className="text-xs leading-relaxed text-slate-600">OpenStreetMap or Google Maps only. Leave blank to build the map from the coordinates.</p>
                                        {err(errors, 'map_embed_url') && <p className={fieldErrorClass}>{err(errors, 'map_embed_url')}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="map_alt_text">Map alt text</Label>
                                        <Input id="map_alt_text" name="map_alt_text" value={draft.mapAltText} onChange={(e) => setDraft((d) => ({ ...d, mapAltText: e.target.value }))} maxLength={240} className={inputClass} aria-invalid={Boolean(err(errors, 'map_alt_text'))} />
                                        {err(errors, 'map_alt_text') && <p className={fieldErrorClass}>{err(errors, 'map_alt_text')}</p>}
                                    </div>
                                    <MapPreview embedUrl={draft.mapEmbedUrl} hasCoordinates={draft.latitude !== '' && draft.longitude !== ''} />
                                </PageCard>

                                <PageCard title="Visiting" hint="Ward visiting slots and the safety note shown beside them.">
                                    <HoursEditor hours={draft.visitingHours} max={maxVisitingSlots} onAdd={() => setDraft((d) => ({ ...d, visitingHours: [...d.visitingHours, { ...EMPTY_HOUR }] }))} onChange={(index, field, value) => setDraft((d) => ({ ...d, visitingHours: d.visitingHours.map((h, i) => (i === index ? { ...h, [field]: value } : h)) }))} onRemove={(index) => setDraft((d) => ({ ...d, visitingHours: d.visitingHours.filter((_, i) => i !== index) }))} error={err(errors, 'visiting_hours')} />
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="visiting_policy_note">Policy note</Label>
                                        <textarea id="visiting_policy_note" name="visiting_policy_note" value={draft.visitingPolicyNote} onChange={(e) => setDraft((d) => ({ ...d, visitingPolicyNote: e.target.value }))} maxLength={1000} rows={3} aria-invalid={Boolean(err(errors, 'visiting_policy_note'))} className={textareaClass} />
                                        {err(errors, 'visiting_policy_note') && <p className={fieldErrorClass}>{err(errors, 'visiting_policy_note')}</p>}
                                    </div>
                                </PageCard>

                                <PageCard title="Governance" hint="Who reviewed this, and when. Only publishers can publish.">
                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="owner">Owner</Label>
                                            <Input id="owner" name="owner" value={draft.owner} onChange={(e) => setDraft((d) => ({ ...d, owner: e.target.value }))} maxLength={120} className={inputClass} aria-invalid={Boolean(err(errors, 'owner'))} />
                                            {err(errors, 'owner') && <p className={fieldErrorClass}>{err(errors, 'owner')}</p>}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="reviewed_at">Reviewed on</Label>
                                            <Input id="reviewed_at" name="reviewed_at" type="date" value={draft.reviewedAt} onChange={(e) => setDraft((d) => ({ ...d, reviewedAt: e.target.value }))} className={inputClass} aria-invalid={Boolean(err(errors, 'reviewed_at'))} />
                                            {err(errors, 'reviewed_at') && <p className={fieldErrorClass}>{err(errors, 'reviewed_at')}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status">Publication status</Label>
                                        <select id="status" name="status" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as 'draft' | 'published' }))} className={inputClass} aria-invalid={Boolean(err(errors, 'status'))}>
                                            {statusOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option === 'draft' ? 'Draft' : 'Published'}
                                                </option>
                                            ))}
                                        </select>
                                        {err(errors, 'status') && <p className={fieldErrorClass}>{err(errors, 'status')}</p>}
                                    </div>
                                </PageCard>

                                <div className="flex flex-wrap items-center justify-end gap-3">
                                    <Button type="submit" disabled={processing} className="h-11 bg-fmca-green text-sm font-semibold text-white hover:bg-fmca-green/90">
                                        {processing ? 'Saving…' : 'Save about page'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

function MilestoneEditor({ milestones, max, onAdd, onChange, onRemove, error }: { milestones: MilestoneDraft[]; max: number; onAdd: () => void; onChange: (index: number, field: keyof MilestoneDraft, value: string) => void; onRemove: (index: number) => void; error: string }) {
    return (
        <div className="grid gap-2.5">
            <div className="flex items-center justify-between">
                <Label>History milestones</Label>
                <span className="text-xs text-slate-500">
                    {milestones.length} / {max}
                </span>
            </div>
            {milestones.length === 0 && <p className="text-xs leading-relaxed text-slate-600">No milestones yet. Add one per year, oldest first.</p>}
            {milestones.map((milestone, index) => (
                <div key={index} className="grid gap-2.5 rounded-lg border border-fmca-ink/10 bg-fmca-mist/40 p-3 sm:grid-cols-[110px_1fr_32px]">
                    <div className="grid gap-1">
                        <span className="text-xs text-slate-600">Year</span>
                        <Input name={`history_milestones.${index}.year`} value={milestone.year} onChange={(e) => onChange(index, 'year', e.target.value)} maxLength={10} className={inputClass} />
                    </div>
                    <div className="grid gap-1">
                        <span className="text-xs text-slate-600">Title</span>
                        <Input name={`history_milestones.${index}.title`} value={milestone.title} onChange={(e) => onChange(index, 'title', e.target.value)} maxLength={120} className={inputClass} />
                    </div>
                    <Button type="button" variant="ghost" onClick={() => onRemove(index)} aria-label={`Remove milestone ${index + 1}`} className="h-11 w-9 justify-center">
                        <Trash2 size={16} aria-hidden="true" />
                    </Button>
                    <div className="grid gap-1 sm:col-span-3">
                        <span className="text-xs text-slate-600">Body</span>
                        <textarea name={`history_milestones.${index}.body`} value={milestone.body} onChange={(e) => onChange(index, 'body', e.target.value)} maxLength={500} rows={2} className={textareaClass} />
                    </div>
                </div>
            ))}
            {milestones.length < max && (
                <Button type="button" variant="outline" onClick={onAdd} className="h-10 self-start text-sm">
                    <Plus size={16} className="mr-1" aria-hidden="true" />
                    Add milestone
                </Button>
            )}
            {error && <p className={fieldErrorClass}>{error}</p>}
        </div>
    );
}

function AddressEditor({ lines, max, onAdd, onChange, onRemove, error }: { lines: string[]; max: number; onAdd: () => void; onChange: (index: number, value: string) => void; onRemove: (index: number) => void; error: string }) {
    return (
        <div className="grid gap-2.5">
            <div className="flex items-center justify-between">
                <Label>Address lines</Label>
                <span className="text-xs text-slate-500">
                    {lines.length} / {max}
                </span>
            </div>
            {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-[1fr_40px] gap-2.5">
                    <Input name={`address_lines.${index}`} value={line} onChange={(e) => onChange(index, e.target.value)} maxLength={200} placeholder={`Address line ${index + 1}`} className={inputClass} />
                    <Button type="button" variant="ghost" onClick={() => onRemove(index)} aria-label={`Remove address line ${index + 1}`} className="h-11 w-10 justify-center">
                        <Trash2 size={16} aria-hidden="true" />
                    </Button>
                </div>
            ))}
            {lines.length < max && (
                <Button type="button" variant="outline" onClick={onAdd} className="h-10 self-start text-sm">
                    <Plus size={16} className="mr-1" aria-hidden="true" />
                    Add address line
                </Button>
            )}
            {error && <p className={fieldErrorClass}>{error}</p>}
        </div>
    );
}

function HoursEditor({ hours, max, onAdd, onChange, onRemove, error }: { hours: HourDraft[]; max: number; onAdd: () => void; onChange: (index: number, field: keyof HourDraft, value: string) => void; onRemove: (index: number) => void; error: string }) {
    return (
        <div className="grid gap-2.5">
            <div className="flex items-center justify-between">
                <Label>Visiting slots</Label>
                <span className="text-xs text-slate-500">
                    {hours.length} / {max}
                </span>
            </div>
            {hours.length === 0 && <p className="text-xs leading-relaxed text-slate-600">No slots yet. Add one per ward group.</p>}
            {hours.map((slot, index) => (
                <div key={index} className="grid gap-2.5 rounded-lg border border-fmca-ink/10 bg-fmca-mist/40 p-3 sm:grid-cols-[1fr_1fr_1fr_32px]">
                    <div className="grid gap-1">
                        <span className="text-xs text-slate-600">Day range</span>
                        <Input name={`visiting_hours.${index}.day_range`} value={slot.dayRange} onChange={(e) => onChange(index, 'dayRange', e.target.value)} maxLength={80} className={inputClass} />
                    </div>
                    <div className="grid gap-1">
                        <span className="text-xs text-slate-600">Morning</span>
                        <Input name={`visiting_hours.${index}.morning_slot`} value={slot.morningSlot} onChange={(e) => onChange(index, 'morningSlot', e.target.value)} maxLength={60} className={inputClass} />
                    </div>
                    <div className="grid gap-1">
                        <span className="text-xs text-slate-600">Evening</span>
                        <Input name={`visiting_hours.${index}.evening_slot`} value={slot.eveningSlot} onChange={(e) => onChange(index, 'eveningSlot', e.target.value)} maxLength={60} className={inputClass} />
                    </div>
                    <Button type="button" variant="ghost" onClick={() => onRemove(index)} aria-label={`Remove visiting slot ${index + 1}`} className="h-11 w-9 justify-center">
                        <Trash2 size={16} aria-hidden="true" />
                    </Button>
                    <div className="grid gap-1 sm:col-span-4">
                        <span className="text-xs text-slate-600">Ward / note</span>
                        <Input name={`visiting_hours.${index}.status`} value={slot.status} onChange={(e) => onChange(index, 'status', e.target.value)} maxLength={80} className={inputClass} />
                    </div>
                </div>
            ))}
            {hours.length < max && (
                <Button type="button" variant="outline" onClick={onAdd} className="h-10 self-start text-sm">
                    <Plus size={16} className="mr-1" aria-hidden="true" />
                    Add slot
                </Button>
            )}
            {error && <p className={fieldErrorClass}>{error}</p>}
        </div>
    );
}

function MapPreview({ embedUrl, hasCoordinates }: { embedUrl: string; hasCoordinates: boolean }) {
    const trimmed = embedUrl.trim();

    return (
        <div className="grid gap-1.5">
            <span className="text-xs font-medium text-slate-700">Map preview</span>
            {trimmed !== '' ? (
                <div className="overflow-hidden rounded-lg border border-fmca-ink/10">
                    <iframe src={trimmed} title="Map embed preview" loading="lazy" className="aspect-[4/3] w-full border-0" />
                </div>
            ) : hasCoordinates ? (
                <p className="rounded-lg border border-dashed border-fmca-ink/20 bg-fmca-mist/50 p-3 text-xs leading-relaxed text-slate-600">
                    OpenStreetMap will be built from these coordinates and shown to visitors.
                </p>
            ) : (
                <p className="rounded-lg border border-dashed border-fmca-ink/20 bg-fmca-mist/50 p-3 text-xs leading-relaxed text-slate-600">
                    No coordinates yet. Enter latitude and longitude, or an embed URL, to show a map.
                </p>
            )}
        </div>
    );
}
