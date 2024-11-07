export function cls(className: (string | boolean | undefined)[]): string {
  return className.filter(Boolean).join(' ')
}
