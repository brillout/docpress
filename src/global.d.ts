// https://stackoverflow.com/questions/52005083/how-to-define-css-variables-in-style-attribute-in-react-and-typescript/70398145#70398145
import 'react'
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
