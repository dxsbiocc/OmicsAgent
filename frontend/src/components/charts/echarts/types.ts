export interface SymbolOption {
  symbol?: string;
  symbolSize?: number | number[];
  symbolRotate?: number;
  symbolKeepAspect?: boolean;
  symbolOffset?: number[];
}

export interface ItemStyleOption {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderType?: "solid" | "dashed" | "dotted";
  opacity?: number;
}

export interface LineStyleOption {
  color?: string;
  width?: number;
  type?: "solid" | "dashed" | "dotted";
  opacity?: number;
}

export interface LabelOption {
  show?: boolean;
  position?: string;
  distance?: number;
  formatter?: string | ((params: any) => string);
  color?: string;
  fontStyle?: string;
  fontWeight?: number;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  backgroundColor?: string;
  padding?: number[];
  width?: number;
  height?: number;
  rich?: any;
}
