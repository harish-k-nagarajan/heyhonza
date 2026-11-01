const DEFAULT_CPF = 2;

export function typedCount(frame: number, start: number, length: number, cpf = DEFAULT_CPF) {
  if (frame < start) return 0;
  return Math.min(length, Math.floor((frame - start) * cpf));
}

export function typedSlice(frame: number, start: number, text: string, cpf = DEFAULT_CPF) {
  return text.slice(0, typedCount(frame, start, text.length, cpf));
}

export function lineFinished(frame: number, start: number, text: string, cpf = DEFAULT_CPF) {
  return typedCount(frame, start, text.length, cpf) >= text.length;
}
