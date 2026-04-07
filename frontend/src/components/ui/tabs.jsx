import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"

const TabsContext = createContext({ value: "", onChange: () => {} })

function Tabs({ value, onChange, className, children, ...props }) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={cn(className)} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }) {
  return (
    <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />
  )
}

function TabsTrigger({ value, className, ...props }) {
  const { value: selected, onChange } = useContext(TabsContext)
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
        selected === value && "bg-background text-foreground shadow",
        className
      )}
      onClick={() => onChange(value)}
      {...props}
    />
  )
}

function TabsContent({ value, className, ...props }) {
  const { value: selected } = useContext(TabsContext)
  if (selected !== value) return null
  return <div className={cn("mt-2", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
