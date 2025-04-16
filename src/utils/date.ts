import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat); // 必须引入并使用插件

export const getRelativeDate = (date: string | Date) => {
  const today = dayjs().startOf("day");
  const inputDate = dayjs(date).startOf("day");
  const diffDays = today.diff(inputDate, "day");

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return inputDate.format("YYYY/MM/DD");
  }
};
