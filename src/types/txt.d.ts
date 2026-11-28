// Raw-импорт текстовых ассетов: import text from './file.txt?raw'
// Правило webpack для сборки — в next.config.ts; Vite (vitest) поддерживает ?raw сам.
declare module '*.txt?raw' {
  const content: string
  export default content
}
