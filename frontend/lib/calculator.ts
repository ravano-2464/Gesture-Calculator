import type { Operator } from "@/lib/types";

const OPERATOR_PRECEDENCE: Record<Operator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
};

export function isOperator(token: string): token is Operator {
  return token === "+" || token === "-" || token === "*" || token === "/";
}

export function isDigitToken(token: string) {
  return /^\d$/.test(token);
}

export function serializeExpression(tokens: string[]) {
  return tokens.join(" ");
}

export function canEvaluate(tokens: string[]) {
  return tokens.length > 0 && !isOperator(tokens[tokens.length - 1]);
}

export function appendToken(tokens: string[], token: string) {
  if (isDigitToken(token)) {
    if (tokens.length === 0) {
      return [token];
    }

    const lastToken = tokens[tokens.length - 1];

    if (isOperator(lastToken)) {
      return [...tokens, token];
    }

    return [...tokens.slice(0, -1), `${lastToken}${token}`];
  }

  if (!isOperator(token) || tokens.length === 0) {
    return tokens;
  }

  const lastToken = tokens[tokens.length - 1];

  if (isOperator(lastToken)) {
    return [...tokens.slice(0, -1), token];
  }

  return [...tokens, token];
}

export function removeLastToken(tokens: string[]) {
  if (tokens.length === 0) {
    return tokens;
  }

  const lastToken = tokens[tokens.length - 1];

  if (!isOperator(lastToken) && lastToken.length > 1) {
    return [...tokens.slice(0, -1), lastToken.slice(0, -1)];
  }

  return tokens.slice(0, -1);
}

function applyTopOperator(values: number[], operators: Operator[]) {
  const operator = operators.pop();
  const rightOperand = values.pop();
  const leftOperand = values.pop();

  if (
    operator === undefined ||
    rightOperand === undefined ||
    leftOperand === undefined
  ) {
    throw new Error("Ekspresi tidak valid.");
  }

  switch (operator) {
    case "+":
      values.push(leftOperand + rightOperand);
      return;
    case "-":
      values.push(leftOperand - rightOperand);
      return;
    case "*":
      values.push(leftOperand * rightOperand);
      return;
    case "/":
      if (rightOperand === 0) {
        throw new Error("Tidak bisa membagi dengan nol.");
      }

      values.push(leftOperand / rightOperand);
      return;
  }
}

function formatNumber(value: number) {
  const rounded = Number(value.toFixed(6));

  if (Object.is(rounded, -0)) {
    return "0";
  }

  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function evaluateExpression(tokens: string[]) {
  if (!canEvaluate(tokens)) {
    throw new Error("Ekspresi belum lengkap.");
  }

  const values: number[] = [];
  const operators: Operator[] = [];

  for (const token of tokens) {
    if (isOperator(token)) {
      while (
        operators.length > 0 &&
        OPERATOR_PRECEDENCE[operators[operators.length - 1]] >=
          OPERATOR_PRECEDENCE[token]
      ) {
        applyTopOperator(values, operators);
      }

      operators.push(token);
      continue;
    }

    const numericValue = Number(token);

    if (Number.isNaN(numericValue)) {
      throw new Error(`Token "${token}" bukan angka valid.`);
    }

    values.push(numericValue);
  }

  while (operators.length > 0) {
    applyTopOperator(values, operators);
  }

  if (values.length !== 1 || !Number.isFinite(values[0])) {
    throw new Error("Gagal menghitung hasil.");
  }

  return formatNumber(values[0]);
}
