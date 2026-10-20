import { Form, Head } from '@inertiajs/react';
import { Image as ImageIcon, UploadCloud, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import cmsMedia from '@/routes/cms/media';

type MediaUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  canUpload: boolean;
};

function formatBytes(size?: number | null): string {
  if (!size) {
    return '';
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaUploadModal({
  isOpen,
  onClose,
  canUpload,
}: MediaUploadModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Head title="Upload media | FMCA Content Studio" />
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader className="flex items-center gap-3">
            <UploadCloud size={24} className="text-fmca-green" aria-hidden="true" />
            <DialogTitle>Upload media</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Approved imagery and short video for campaigns, blocks and home page modules.
            Upload new assets, keep alt text and ownership current, and mark each item when it
            is reviewed.
          </DialogDescription>
          <Form
            method="post"
            action={cmsMedia.store.url()}
            resetOnError
            className="mt-6 grid gap-5 sm:grid-cols-2"
          >
            {({ errors, processing }) => (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="modal-media-label">
                    Label <span className="text-fmca-crimson">*</span>
                  </Label>
                  <Input
                    id="modal-media-label"
                    name="label"
                    maxLength={120}
                    className="h-11"
                    aria-invalid={Boolean(errors.label)}
                  />
                  {errors.label && <p className="text-xs font-medium text-fmca-crimson">{errors.label}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="modal-media-kind">Type</Label>
                  <select
                    id="modal-media-kind"
                    name="kind"
                    defaultValue="image"
                    className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                  >
                    <option value="image">
                      Image (jpg, png, webp, gif · 4 MB max)
                    </option>
                    <option value="video">
                      Video (mp4, webm, mov · 50 MB max)
                    </option>
                  </select>
                  {errors.kind && <p className="text-xs font-medium text-fmca-crimson">{errors.kind}</p>}
                </div>

                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="modal-media-file">
                    File <span className="text-fmca-crimson">*</span>
                  </Label>
                  <input
                    id="modal-media-file"
                    name="file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
                    className="h-11 w-full cursor-pointer rounded-md border border-dashed border-fmca-ink/25 bg-white px-3 text-sm text-slate-600 file:ml-3 file:border-0 file:bg-fmca-mist file:px-3 file:py-2 file:text-xs file:font-bold file:text-fmca-green dark:bg-transparent file:dark:bg-transparent focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                    aria-invalid={Boolean(errors.file)}
                  />
                  {errors.file && <p className="text-xs font-medium text-fmca-crimson">{errors.file}</p>}
                </div>

                <div className="grid gap-1.5 sm:col-span-2">
                  <Label htmlFor="modal-media-alt">
                    Alt text <span className="text-fmca-crimson">*</span>
                  </Label>
                  <Input
                    id="modal-media-alt"
                    name="alt_text"
                    maxLength={500}
                    className="h-11"
                    aria-invalid={Boolean(errors.alt_text)}
                  />
                  {errors.alt_text && <p className="text-xs font-medium text-fmca-crimson">{errors.alt_text}</p>}
                  <p className="text-xs text-slate-500">
                    Describe what the asset shows. It is used for accessible rendering of campaigns and blocks.
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="modal-media-owner">Content owner</Label>
                  <Input
                    id="modal-media-owner"
                    name="owner"
                    maxLength={120}
                    className="h-11"
                  />
                  <p className="text-xs text-slate-500">
                    Team or desk name, not a single person.
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="modal-media-reviewed">Last reviewed</Label>
                  <input
                    id="modal-media-reviewed"
                    name="reviewed_at"
                    type="date"
                    className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-fmca-ink outline-none focus-visible:border-fmca-sky focus-visible:ring-[3px] focus-visible:ring-fmca-sky/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-fmca-green px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-fmca-green-dark focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-fmca-sky disabled:opacity-50"
                  >
                    <UploadCloud size={18} aria-hidden="true" />
                    {processing ? 'Uploading…' : 'Add to library'}
                  </Button>
                </div>
              </>
            )}
          </Form>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="h-10 px-4"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}