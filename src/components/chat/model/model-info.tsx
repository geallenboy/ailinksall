import { formatNumber } from "@/lib/chat/helper";
import { TModel } from "@/types/chat";

export type TModelInfo = {
  model: TModel;
  showDetails?: boolean;
};

export const ModelInfo = ({ model, showDetails }: TModelInfo) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 text-xs md:text-sm items-center">
        {model.icon("sm")} {model.name}
      </div>
      {showDetails && (
        <>
          <div className="flex flex-row justify-between text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
            <p>令牌数</p>
            <p>{formatNumber(model.tokens)} 个令牌</p>
          </div>
          <div className="flex flex-row justify-between text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
            <p>模型</p>
            <p>{model.key}</p>
          </div>
          {model.inputPrice && (
            <div className="flex flex-row justify-between text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              <p>输入价格</p>
              <p>{model.inputPrice} 美元 / 每百万令牌</p>
            </div>
          )}
          {model.outputPrice && (
            <div className="flex flex-row justify-between text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              <p>输出价格</p>
              <p>{model.outputPrice} 美元 / 每百万令牌</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
