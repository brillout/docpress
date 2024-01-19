export default {
  tolerateError
}

function tolerateError({ logText }) {
  return [
    "You are using Vike's deprecated design. Update to the new V1 design, see https://vike.dev/migration/v1-design for how to migrate.",
    'has been externalized for browser compatibility'
  ].some((txt) => logText.includes(txt))
}
