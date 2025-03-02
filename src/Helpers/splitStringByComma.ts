export default function splitStringByComma(input: string): string[] {
  if (!input) return []; // Return empty array if input is empty or undefined
  return input
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
}
