export { Style }

import React from 'react'

function Style({ children }: { children: string }) {
  return <style dangerouslySetInnerHTML={{ __html: children }} />
}
