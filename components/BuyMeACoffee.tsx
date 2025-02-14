import { Button } from "./ui/button"
import { Coffee } from "lucide-react"

export function BuyMeACoffee() {
  return (
    <a
      href="https://buymeacoffee.com/chriskehoe"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 z-50"
    >
      <Button
        variant="outline"
        className="gap-2 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black border-[#FFDD00] hover:border-[#FFDD00]/90"
      >
        <Coffee className="size-4" />
        <span className="hidden sm:inline">Buy me a coffee</span>
      </Button>
    </a>
  )
} 