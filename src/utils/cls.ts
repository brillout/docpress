export { cls }

type Class = string | boolean | undefined

function cls(className: Class | Class[]): string {
  const classNames = Array.isArray(className) ? className : [className]
  return classNames.filter(Boolean).join(' ')
}
