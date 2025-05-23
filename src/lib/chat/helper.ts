import { TChatMessage, TChatSession } from "@/types/chat/chat.type";
import dayjs from "dayjs";

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(0) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(0) + "K";
  } else {
    return number.toString();
  }
}

export const removeExtraSpaces = (str?: string) => {
  str = str?.trim();
  str = str?.replace(/\n{3,}/g, "\n\n");
  return str;
}

export const convertFileToBase64 = (
  file: File,
  onChange: (base64: string) => void
) => {
  if (!file) {
    alert("Please select a file!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const base64String = event?.target?.result as string;
    onChange(base64String);
  };

  reader.onerror = (error: ProgressEvent<FileReader>) => {
    console.error("Error:", error);
    alert("Error reading file!");
  };
};

export const sortSessions = (
  sessions: TChatSession[],
  sortBy: "createdAt" | "updatedAt"
) => {
  return sessions.sort((a, b) => dayjs(b[sortBy]).diff(dayjs(a[sortBy])));
};

export const sortMessages = (messages: TChatMessage[], sortBy: "createdAt") => {
  return messages.sort((a, b) => dayjs(a[sortBy]).diff(dayjs(b[sortBy])));
};

export const generateAndDownloadJson = (data: any, filename: string) => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Url = `data:${response.headers.get(`Content-Type`)};base64,${base64String.split(",")[1]
        }`;
      resolve(base64Url);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
}
