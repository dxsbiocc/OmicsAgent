"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h1>Global Error</h1>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}