import * as pdfjsLib from "pdfjs-dist";

// Turbopack (and Webpack 5) resolve `new URL(..., import.meta.url)` as a
// static asset reference, giving the worker a real hosted URL without a
// manual copy-to-/public step.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const MAX_PDF_PAGES = 20; // generous for lecture slides/worksheets; keeps a mis-selected huge PDF from flooding the board
const RENDER_SCALE = 1.5; // resolution good enough to annotate over without being excessive

export type RenderedPage = { blob: Blob; width: number; height: number };

/** Renders every page of a PDF (capped at MAX_PDF_PAGES) to a PNG blob, or
 * passes an image file through as a single "page" unchanged. */
export async function renderFileToPages(file: File): Promise<RenderedPage[]> {
  if (file.type === "application/pdf") return renderPdfToPages(file);
  if (file.type.startsWith("image/")) return [await renderImageFile(file)];
  throw new Error("Unsupported file — choose an image (PNG/JPG/WEBP) or a PDF.");
}

async function renderImageFile(file: File): Promise<RenderedPage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { blob: file, width, height };
}

async function renderPdfToPages(file: File): Promise<RenderedPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);

  const pages: RenderedPage[] = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: RENDER_SCALE });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not create a canvas context to render the PDF.");

    await page.render({ canvasContext: context, viewport, canvas }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Could not export the rendered page"))), "image/png");
    });

    pages.push({ blob, width: viewport.width, height: viewport.height });
  }

  return pages;
}
