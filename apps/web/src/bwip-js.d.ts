declare module "bwip-js" {
  export type BarcodeOptions = {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    includetext?: boolean;
    textxalign?: "left" | "center" | "right";
    backgroundcolor?: string;
  };

  export type BwipJsBrowser = {
    toCanvas(canvas: HTMLCanvasElement | string, options: BarcodeOptions): HTMLCanvasElement;
  };

  const bwipjs: BwipJsBrowser;
  export default bwipjs;
}
