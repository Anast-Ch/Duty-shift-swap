export type ShiftValues = {
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
};
export type ShiftErrors = Partial<Record<keyof ShiftValues, string>>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const TIME_MESSAGE = "Введите время в формате ЧЧ:ММ (от 00:00 до 23:59)";

function dateExists(value: string): boolean {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() + 1 === m &&
    date.getDate() === d
  );
}

export function validateShift(values: ShiftValues): ShiftErrors {
  const errors: ShiftErrors = {};

  if (values.userId === "") {
    errors.userId = "Выберите сотрудника";
  }

  if (!DATE_PATTERN.test(values.date)) {
    errors.date = "Введите дату в формате ГГГГ-ММ-ДД";
  } else if (!dateExists(values.date)) {
    errors.date = "Такой даты не существует";
  }

  if (!TIME_PATTERN.test(values.startTime)) {
    errors.startTime = TIME_MESSAGE;
  }

  if (!TIME_PATTERN.test(values.endTime)) {
    errors.endTime = TIME_MESSAGE;
  }

  return errors;
}
