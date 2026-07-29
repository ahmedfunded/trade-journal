import { useEffect, useRef } from "react"
import { motion, useInView, useSpring } from "motion/react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  description?: string
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  className?: string
  chart?: React.ReactNode
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, { damping: 25, stiffness: 80 })

  useEffect(() => {
    if (isInView) spring.set(value)
  }, [isInView, value, spring])

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      }
    })
    return () => unsub()
  }, [prefix, suffix, decimals, spring])

  return <span ref={ref} />
}

export function StatsCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  description,
  icon,
  trend,
  className,
  chart,
}: StatsCardProps) {
  const trendColor =
    trend === "up" ? "text-green" : trend === "down" ? "text-red" : "text-text-secondary"

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            {title}
          </span>
          {icon && <span className="text-text-muted">{icon}</span>}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold tracking-tight ${trendColor}`}>
              <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
            </span>
          </div>
          {description && (
            <p className="mt-1 text-xs text-text-secondary">{description}</p>
          )}
          {chart && <div className="mt-3">{chart}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
