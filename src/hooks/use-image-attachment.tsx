import { TAttachment } from "@/types/chat.type";
import { useToast } from "@/components/ui/use-toast";
import { ArrowElbowDownRight, Paperclip, X } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";
import Resizer from "react-image-file-resizer";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const useImageAttachment = () => {
  const [attachment, setAttachment] = useState<TAttachment>();

  const { toast } = useToast();

  const resizeFile = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        "JPEG",
        100,
        0,
        (uri) => {
          console.log(typeof uri);
          resolve(uri);
        },
        "file"
      );
    });

  const handleFileSelect = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const reader = new FileReader();

    const fileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (file && !fileTypes.includes(file?.type)) {
      toast({
        title: "格式无效",
        description: "请选择有效的图片（JPEG、PNG、GIF）。",
        variant: "destructive",
      });
      return;
    }

    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const base64String = reader?.result?.split(",")[1];
      setAttachment((prev) => ({
        ...prev,
        base64: `data:${file?.type};base64,${base64String}`,
      }));
    };

    if (file) {
      setAttachment((prev) => ({
        ...prev,
        file,
      }));
      const resizedFile = await resizeFile(file);

      reader.readAsDataURL(file);
    }
  };

  const renderAttachedImage = () => {
    if (attachment?.base64 && attachment?.file) {
      return (
        <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-full md:w-[700px] lg:w-[720px] justify-start gap-2 pl-3 pr-1">
          <ArrowElbowDownRight size={20} weight="bold" />
          <p className="w-full relative ml-2 text-sm md:text-base flex flex-row gap-2 items-center">
            <Image
              src={attachment.base64}
              alt="上传的图片"
              className="rounded-xl tanslate-y-[50%] min-w-[60px] h-[60px] border border-white/5 absolute rotate-6 shadow-md object-cover"
              width={0}
              height={0}
            />
            <span className="ml-[70px]">{attachment?.file?.name}</span>
          </p>
          <Button
            size={"iconSm"}
            variant="ghost"
            onClick={() => {}}
            className="flex-shrink-0 ml-4"
          >
            <X size={16} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  const renderFileUpload = () => {
    return (
      <>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileSelect}
          className="px-1.5"
        >
          <Paperclip size={16} weight="bold" /> 附加
        </Button>
      </>
    );
  };

  return {
    attachment,
    handleFileSelect,
    handleImageUpload,
    renderAttachedImage,
    renderFileUpload,
  };
};
