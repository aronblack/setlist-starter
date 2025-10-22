'use client'
import { StyleSheetManager } from 'styled-components'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <StyleSheetManager>{children}</StyleSheetManager>
}
