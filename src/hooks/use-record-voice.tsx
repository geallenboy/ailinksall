"use client";
import { blobToBase64 } from "@/lib/chat/record";
import { OpenAI, toFile } from "openai";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePreferenceContext } from "@/context";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { AudioWaveSpinner } from "@/components/ui/audio-wave";
import { RecordIcon, StopIcon } from "@hugeicons/react";
import { useSettingsStore } from "@/store/chat";

export const useRecordVoice = () => {
  const [text, setText] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const { preferences } = usePreferenceContext();
  const { open: openSettings } = useSettingsStore();
  const { toast } = useToast();
  const { apiKeys } = usePreferenceContext();
  const [recording, setRecording] = useState<boolean>(false);
  const [transcribing, setIsTranscribing] = useState<boolean>(false);

  const isRecording = useRef<boolean>(false);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async (): Promise<void> => {
    setText("");
    chunks.current = [];
    if (mediaRecorder) {
      mediaRecorder.start(1000);
      setRecording(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (ev: BlobEvent) => {
        chunks.current.push(ev.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
        blobToBase64(audioBlob, getText);
      };

      setMediaRecorder(mediaRecorder);
      mediaRecorder.start(1000);
      setRecording(true);
    } catch (error) {
      console.error("麦克风访问错误:", error);
      toast({
        title: "麦克风访问被拒绝",
        description: "请授予麦克风访问权限以录制音频。",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder) {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const getText = async (base64data: string): Promise<void> => {
    setIsTranscribing(true);
    try {
      const apiKey = apiKeys.openai;

      if (!apiKey) {
        throw new Error("未找到 API 密钥");
      }

      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const audioBuffer = Buffer.from(base64data, "base64");
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(audioBuffer, "audio.wav", {
          type: "audio/wav",
        }),
        model: "whisper-1",
      });

      setText(transcription?.text || "");
    } catch (error) {
      console.log(error);
      toast({
        title: "转录失败",
        description: "发生了一些问题，请检查您的 OpenAI 设置。",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const startVoiceRecording = async () => {
    const openAIAPIKeys = apiKeys.openai;
    if (!openAIAPIKeys) {
      toast({
        title: "缺少 API 密钥",
        description: "录音需要 OpenAI API 密钥。请检查设置。",
        variant: "destructive",
      });
      openSettings("openai");
      return;
    }

    if (preferences?.whisperSpeechToTextEnabled) {
      startRecording();
    } else {
      toast({
        title: "启用语音转文字",
        description: "录音需要启用语音转文字功能。请检查设置。",
        variant: "destructive",
      });
      openSettings("voice-input");
    }
  };

  const renderRecordingControls = () => {
    if (recording) {
      return (
        <>
          <Button
            variant="ghost"
            size="iconSm"
            rounded={"full"}
            onClick={() => {
              stopRecording();
            }}
          >
            <StopIcon
              size={18}
              variant="solid"
              strokeWidth="2"
              className="text-red-300"
            />{" "}
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="录音">
        <Button size="iconSm" variant="ghost" onClick={startVoiceRecording}>
          <RecordIcon size={18} variant="stroke" strokeWidth="2" />
        </Button>
      </Tooltip>
    );
  };

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner /> <p>正在转录...</p>
        </div>
      );
    }
    if (recording) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-2 pr-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner />
          <p>正在录音...</p>
        </div>
      );
    }
  };

  return {
    recording,
    startRecording,
    stopRecording,
    text,
    transcribing,
    renderRecordingControls,
    renderListeningIndicator,
    startVoiceRecording,
  };
};
