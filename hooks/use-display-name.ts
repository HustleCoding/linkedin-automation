"use client"

import { useEffect, useState } from "react"

export function useDisplayName() {
  const [displayName, setDisplayName] = useState("")

  useEffect(() => {
    let isActive = true

    const updateDisplayName = (nextName: string) => {
      if (isActive) {
        setDisplayName(nextName)
      }
    }

    const loadDisplayName = async () => {
      try {
        const response = await fetch("/api/user/preferences")
        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (data?.preferences?.display_name) {
          updateDisplayName(data.preferences.display_name)
        }
      } catch (error) {
        console.error("Failed to load display name:", error)
      }
    }

    loadDisplayName()

    const handleDisplayNameUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string>
      if (typeof customEvent.detail === "string") {
        updateDisplayName(customEvent.detail)
      }
    }

    window.addEventListener("display-name-updated", handleDisplayNameUpdate)

    return () => {
      isActive = false
      window.removeEventListener("display-name-updated", handleDisplayNameUpdate)
    }
  }, [])

  return displayName
}
