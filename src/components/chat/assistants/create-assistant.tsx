import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react";
import { FormLabel } from "@/components/ui/form-label";
import { ModelSelect } from "@/components/chat/model/model-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddingSoon } from "@/components/ui/adding-soon";
import { Badge } from "@/components/ui/badge";
import { TAssistant } from "@/types/chat.type";

export type TCreateAssistant = {
  assistant?: TAssistant;
  onCreateAssistant: (assistant: Omit<TAssistant, "key">) => void;
  onUpdateAssistant: (assistant: TAssistant) => void;
  onCancel: () => void;
};

export const CreateAssistant = ({
  assistant,
  onCreateAssistant,
  onUpdateAssistant,
  onCancel,
}: TCreateAssistant) => {
  const botTitleRef = useRef<HTMLInputElement | null>(null);

  const formik = useFormik<Omit<TAssistant, "key">>({
    initialValues: {
      name: assistant?.name || "",
      systemPrompt: assistant?.systemPrompt || "",
      baseModel: assistant?.baseModel || "gpt-3.5-turbo",
      type: "custom",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      if (assistant?.key) {
        onUpdateAssistant({ ...values, key: assistant?.key });
      } else {
        onCreateAssistant(values);
      }
      clearAssistant();
      onCancel();
    },
  });

  useEffect(() => {
    botTitleRef?.current?.focus();
  }, [open]);

  const clearAssistant = () => {
    formik.resetForm();
  };

  return (
    <div className="flex flex-col items-start w-full bg-white dark:bg-zinc-800 dark:border dark:border-white/10  relative h-full overflow-hidden rounded-2xl">
      <div className="w-full px-4 py-3 border-b  border-zinc-500/20 flex flex-row gap-3 items-center">
        <p className="text-base font-medium">
          {assistant?.key ? "编辑助手" : "添加新助手"}
        </p>
        <Badge>测试版</Badge>
      </div>
      <div className="flex flex-col w-full p-4 gap-6 items-start h-full overflow-y-auto no-scrollbar pb-[100px]">
        <div className="flex flex-row items-center justify-between gap-2 w-full">
          <FormLabel label="基础模型" />
          <ModelSelect
            variant="secondary"
            fullWidth
            className="w-full justify-start p-2 h-10"
            selectedModel={formik.values.baseModel}
            setSelectedModel={(model) => {
              formik.setFieldValue("baseModel", model);
            }}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="助手名称" />
          <Input
            type="text"
            name="name"
            placeholder="助手名称"
            value={formik.values.name}
            ref={botTitleRef}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="系统提示词">
            为机器人分配角色，帮助用户理解机器人可以做什么。
          </FormLabel>
          <Textarea
            name="systemPrompt"
            placeholder="你是一个乐于助人的助手。你的角色是帮助用户解答他们的问题。"
            value={formik.values.systemPrompt}
            onChange={formik.handleChange}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <FormLabel label="知识库">
            提供自定义知识，您的机器人将访问这些知识来为回答提供信息。机器人会根据用户消息从知识库中检索相关部分。知识库中的数据可能会通过机器人回复或引用对其他用户可见。
          </FormLabel>
          <Button variant="default" disabled={true} className="opacity-20">
            <Plus size={20} weight="bold" /> 添加知识 <AddingSoon />
          </Button>
        </div>
      </div>
      <div className="w-full p-2 border-t justify-between border-zinc-500/20 flex flex-row gap-1 items-center">
        <Button variant="ghost" onClick={onCancel}>
          返回
        </Button>
        <Button
          variant="default"
          onClick={() => {
            formik.handleSubmit();
          }}
        >
          保存
        </Button>
      </div>
    </div>
  );
};
