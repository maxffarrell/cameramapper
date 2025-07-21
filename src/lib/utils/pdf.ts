import { browser } from '$app/environment';

let pdfjsLib: typeof import('pdfjs-dist') | null = null;

// Only import PDF.js on the client side
async function initPdfjs() {
	if (!browser || pdfjsLib) return pdfjsLib;
	
	pdfjsLib = await import('pdfjs-dist');
	pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';
	
	return pdfjsLib;
}

export interface PdfPage {
	page: any; // PDFPageProxy
	viewport: any; // PageViewport
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
}

export async function loadPdf(file: File): Promise<any> {
	if (!browser) throw new Error('PDF loading only available in browser');
	
	const pdfjs = await initPdfjs();
	if (!pdfjs) throw new Error('Failed to initialize PDF.js');
	
	const arrayBuffer = await file.arrayBuffer();
	const uint8Array = new Uint8Array(arrayBuffer);
	
	const loadingTask = pdfjs.getDocument({
		data: uint8Array,
	});
	
	return await loadingTask.promise;
}

export async function renderPdfPage(
	page: any, 
	scale: number = 1.5
): Promise<PdfPage> {
	if (!browser) throw new Error('PDF rendering only available in browser');
	
	const viewport = page.getViewport({ scale });
	
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d')!;
	
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	
	const renderContext = {
		canvasContext: context,
		viewport: viewport,
	};
	
	await page.render(renderContext).promise;
	
	return {
		page,
		viewport,
		canvas,
		context
	};
}

export function drawPdfOnCanvas(
	targetCtx: CanvasRenderingContext2D,
	pdfPage: PdfPage,
	x: number = 0,
	y: number = 0
) {
	targetCtx.drawImage(pdfPage.canvas, x, y);
}