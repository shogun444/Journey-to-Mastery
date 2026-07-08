"use client"

import { Component, type ReactNode } from "react"
import { Card } from "./card"
import { Heading } from "./heading"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <Card className="p-8 text-center">
            <Heading as="h2">Something went wrong</Heading>
            <p className="text-sm text-zinc-400 mt-2">
              {this.state.error?.message ?? "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Try again
            </button>
          </Card>
        )
      )
    }

    return this.props.children
  }
}
