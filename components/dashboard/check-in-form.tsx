"use client";

import {
  FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { CheckInActionState, createCheckIn } from "@/app/dashboard/actions";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: CheckInActionState = {};
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_COMPRESSION_QUALITY = 0.82;

type CheckInFormProps = {
  existingDates: string[];
};

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readImageDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read image."));
    };

    reader.onerror = () => reject(reader.error ?? new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = source;
  });
}

async function compressImageFile(file: File) {
  const dataUrl = await readImageDataUrl(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");

  let width = image.width;
  let height = image.height;
  const largestSide = Math.max(width, height);

  if (largestSide > MAX_IMAGE_DIMENSION) {
    const scale = MAX_IMAGE_DIMENSION / largestSide;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not create image canvas.");
  }

  context.drawImage(image, 0, 0, width, height);

  const mimeType = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, IMAGE_COMPRESSION_QUALITY);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const nextExtension = mimeType === "image/jpeg" ? "jpg" : file.name.split(".").pop() ?? "jpg";
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${baseName}.${nextExtension}`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

export function CheckInForm({ existingDates }: CheckInFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipPreprocessRef = useRef(false);
  const [state, action] = useActionState(createCheckIn, initialState);
  const [isRefreshing, startRefresh] = useTransition();
  const [compressionNote, setCompressionNote] = useState<string | null>(null);
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const today = useSyncExternalStore(
    () => () => undefined,
    getLocalDateString,
    () => "",
  );

  useEffect(() => {
    if (state.success) {
      startRefresh(() => {
        router.refresh();
      });
    }
  }, [router, state.success]);

  const alreadyCheckedInToday = useMemo(() => {
    if (!today) {
      return false;
    }

    return existingDates.includes(today);
  }, [existingDates, today]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (skipPreprocessRef.current) {
      skipPreprocessRef.current = false;
      return;
    }

    const fileInput = fileInputRef.current;
    const file = fileInput?.files?.[0];

    if (!file || !fileInput) {
      return;
    }

    setCompressionNote(null);

    if (!file.type.startsWith("image/")) {
      setCompressionNote("Images are compressed in the browser. Videos upload as-is.");
      return;
    }

    event.preventDefault();
    setIsPreparingUpload(true);

    try {
      const compressedFile = await compressImageFile(file);

      if (compressedFile !== file) {
        const transfer = new DataTransfer();
        transfer.items.add(compressedFile);
        fileInput.files = transfer.files;
        setCompressionNote(
          `Image compressed before upload: ${(file.size / 1024 / 1024).toFixed(2)} MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB.`,
        );
      } else {
        setCompressionNote("Image kept at original size because compression would not reduce it.");
      }

      skipPreprocessRef.current = true;
      formRef.current?.requestSubmit();
    } catch {
      setCompressionNote("Image compression was skipped. Uploading the original file.");
      skipPreprocessRef.current = true;
      formRef.current?.requestSubmit();
    } finally {
      setIsPreparingUpload(false);
    }
  }

  if (alreadyCheckedInToday) {
    return (
      <div className="rounded-lg border border-[var(--green)]/25 bg-[#0d2a1a] p-5">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-300">
          Content saved
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">
          Today&apos;s submission is already saved.
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/72">
          You can upload another piece tomorrow. Today&apos;s content is already in
          your library below.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="local_date" value={today} />

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Content file
        </span>
        <input
          ref={fileInputRef}
          type="file"
          name="content_file"
          accept="image/*,video/*"
          className="block min-h-12 w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 py-3 text-sm text-[var(--white)] outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[var(--yellow)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-black focus:border-[var(--yellow)]"
          required
        />
      </label>

      <p className="text-xs leading-6 text-[var(--muted)]">
        Images are compressed in the browser before upload. Videos upload at their
        original size.
      </p>

      <label className="block space-y-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
          Caption (optional)
        </span>
        <textarea
          name="caption"
          placeholder="Morning miles before work. Fuel felt great."
          rows={4}
          className="w-full rounded-md border border-[var(--black-5)] bg-[var(--black-3)] px-4 py-3 text-sm text-[var(--white)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--yellow)]"
        />
      </label>

      {compressionNote ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[var(--muted-2)]">
          {compressionNote}
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state.success}
        </p>
      ) : null}

      <SubmitButton
        label={
          isPreparingUpload
            ? "Preparing upload..."
            : isRefreshing
              ? "Refreshing portal..."
              : "Submit this month’s content"
        }
        pendingLabel="Uploading content..."
        disabled={isPreparingUpload}
      />
    </form>
  );
}
