import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const calculatorTool = () => {
  const calculatorSchema = z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("要执行的操作类型。"),
    number1: z.number().describe("要操作的第一个数字。"),
    number2: z.number().describe("要操作的第二个数字。"),
  });

  return new DynamicStructuredTool({
    name: "calculator",
    description: "可以执行数学运算。",
    schema: calculatorSchema,
    func: async ({ operation, number1, number2 }) => {
      if (operation === "add") {
        return `${number1 + number2}`;
      } else if (operation === "subtract") {
        return `${number1 - number2}`;
      } else if (operation === "multiply") {
        return `${number1 * number2}`;
      } else if (operation === "divide") {
        return `${number1 / number2}`;
      } else {
        throw new Error("无效的操作。");
      }
    },
  });
};

export { calculatorTool };
