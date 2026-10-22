export type Platform =
  | "web"
  | "windows"
  | "linux"
  | "macos"
  | "android"
  | "cli";
export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };
export type Input = Record<string, Json>;
export interface Schema {
  type: string;
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  items?: Schema;
  enum?: Json[];
}
export interface Action {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: string;
  tags: string[];
  input_schema: Schema;
  output_schema: Schema;
  platforms: Platform[];
  permissions: string[];
  risk_level: "safe" | "sensitive" | "dangerous";
  timeout: number;
  example: Input;
  expected?: Json;
  handler: (input: Input) => Json | Promise<Json>;
}
export class AppError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}
