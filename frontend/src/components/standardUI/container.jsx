import React from "react"

export default function Container({ children }) {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
