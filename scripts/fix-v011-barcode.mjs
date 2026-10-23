import { readFile, writeFile } from "node:fs/promises";

const path = "apps/web/src/PowerStudioWorkspace.tsx";
let text = await readFile(path, "utf8");

const oldOptions = `        scale: 3,
        height: barcodeType === "qrcode" || barcodeType === "datamatrix" ? 28 : 14,
        includetext: barcodeType !== "qrcode" && barcodeType !== "datamatrix",
        textxalign: "center",
        backgroundcolor: "FFFFFF",
`;
const newOptions = `        scale: 4,
        height: barcodeType === "qrcode" || barcodeType === "datamatrix" ? 28 : 16,
        includetext: barcodeType !== "qrcode" && barcodeType !== "datamatrix",
        textxalign: "center",
        backgroundcolor: "FFFFFF",
`;
if (!text.includes(oldOptions)) throw new Error("barcode render options anchor not found");
text = text.replace(oldOptions, newOptions);

const oldScan = `      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const url = URL.createObjectURL(file);
      try {
        const result = await reader.decodeFromImageUrl(url);
        setScanResult(result.getText());
        setNotice(t("识别完成。", "Barcode decoded."));
      } finally {
        URL.revokeObjectURL(url);
      }
`;
const newScan = `      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const url = URL.createObjectURL(file);
      try {
        try {
          const result = await reader.decodeFromImageUrl(url);
          setScanResult(result.getText());
        } catch (firstError) {
          const bitmap = await createImageBitmap(file);
          try {
            const scale = Math.max(2, Math.min(4, Math.ceil(1200 / Math.max(bitmap.width, bitmap.height))));
            const quiet = 48;
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width * scale + quiet * 2;
            canvas.height = bitmap.height * scale + quiet * 2;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (!context) throw firstError;
            context.imageSmoothingEnabled = false;
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(bitmap, quiet, quiet, bitmap.width * scale, bitmap.height * scale);
            const result = reader.decodeFromCanvas(canvas);
            setScanResult(result.getText());
          } finally {
            bitmap.close();
          }
        }
        setNotice(t("识别完成。", "Barcode decoded."));
      } finally {
        URL.revokeObjectURL(url);
      }
`;
if (!text.includes(oldScan)) throw new Error("barcode scanner anchor not found");
text = text.replace(oldScan, newScan);
await writeFile(path, text);
