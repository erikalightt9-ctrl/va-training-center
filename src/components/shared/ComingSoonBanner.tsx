import { Rocket } from "lucide-react"

interface ComingSoonBannerProps {
  readonly feature: string
  readonly description?: string
}

export function ComingSoonBanner({ feature, description }: ComingSoonBannerProps) {
  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
      <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <Rocket className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-600">{feature} — Coming Soon</h3>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{description}</p>
      )}
    </div>
  )
}
