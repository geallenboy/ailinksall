import { JSX } from "react";
import { TToolKey } from "./tool.type";

export enum ModelType {
    Gemini15Pro = "gemini-1.5-pro",
    GPT4 = "gpt-4",
    CLAUDE3 = "claude-3",
    Grok3 = "grok-3",
}
export type TBaseModel = "openai" | "anthropic" | "gemini" | "grok" | "deepseek" | "ollama";
export const models = [
    "gpt-4o",
    "gpt-4",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-0125",
    "gpt-3.5-turbo-instruct",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "gemini-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "phi3:latest",
];

export type TModelKey = (typeof models)[number] | string;

export type TModel = {
    name: string;
    key: TModelKey;
    isNew?: boolean;
    icon: (size: "sm" | "md" | "lg") => JSX.Element;
    inputPrice?: number;
    outputPrice?: number;
    tokens: number;
    plugins: TToolKey[];
    baseModel: TBaseModel;
    maxOutputTokens: number;
};