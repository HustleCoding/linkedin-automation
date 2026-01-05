"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Search,
  PenSquare,
  Calendar,
  BarChart3,
  LogOut,
  Settings,
  Menu,
  X,
  ChevronUp,
  FileText,
  Plus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: Home, label: "Home", href: "/home" },
  { icon: Search, label: "Research", href: "/research" },
  { icon: PenSquare, label: "Content Lab", href: "/content-lab" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
]

interface SidebarProps {
  onOpenDrafts?: () => void
  onNewDraft?: () => void
}

export function Sidebar({ onOpenDrafts, onNewDraft }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const getInitials = (email: string) => {
    if (!email) return "U"
    return email
      .split("@")[0]
      .split(".")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border/70 bg-background/80 px-4 shadow-sm backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400 shadow-sm">
            <span className="text-sm font-bold text-primary-foreground">LA</span>
          </div>
          <span className="font-semibold text-foreground">LinkAgent</span>
        </div>
        <div className="flex items-center gap-2">
          {onOpenDrafts && (
            <Button variant="ghost" size="icon" onClick={onOpenDrafts} aria-label="View drafts">
              <FileText className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-sidebar-border/70 bg-sidebar/85 shadow-sm transition-transform duration-300 ease-in-out backdrop-blur-xl",
          "lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Desktop only */}
          <div className="hidden border-b border-sidebar-border/70 px-4 py-4 lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sky-400 shadow-sm">
                <span className="text-lg font-bold text-primary-foreground">LA</span>
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">LinkAgent</h2>
                <p className="text-xs text-muted-foreground">AI Content Studio</p>
              </div>
            </div>
          </div>

          {/* Drafts actions section */}
          <div className="space-y-3 px-3 pt-4 pb-2">
            <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/40 p-3 shadow-sm">
              <Button
                variant="default"
                className="w-full justify-start gap-2 shadow-sm"
                onClick={() => {
                  onNewDraft?.()
                  setMobileOpen(false)
                }}
              >
                <Plus className="h-4 w-4" />
                New Post
              </Button>
              <Button
                variant="ghost"
                className="mt-2 w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent/70"
                onClick={() => {
                  onOpenDrafts?.()
                  setMobileOpen(false)
                }}
              >
                <FileText className="h-4 w-4" />
                My Drafts
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-sidebar-border/70 bg-sidebar/60 px-3 py-2 text-xs text-muted-foreground">
              <span>Plan</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">Pro</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === "/" && pathname === "/content-lab")

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-sidebar-accent text-primary shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-sidebar-border/70 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-sidebar-accent/70">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                    <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{userEmail || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
