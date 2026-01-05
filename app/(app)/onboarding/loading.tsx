import { Loader2 } from "lucide-react"

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#0A66C2]" />
    </div>
  )
}
