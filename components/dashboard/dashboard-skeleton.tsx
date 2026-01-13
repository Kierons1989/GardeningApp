'use client'

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div
          className="h-10 w-48 rounded-lg mb-2"
          style={{ background: 'var(--stone-200)' }}
        />
        <div
          className="h-5 w-32 rounded-lg"
          style={{ background: 'var(--stone-100)' }}
        />
      </div>

      {/* Task cards skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6"
            style={{ background: 'white', border: '1px solid var(--stone-100)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-lg"
                style={{ background: 'var(--stone-200)' }}
              />
              <div className="flex-1">
                <div
                  className="h-5 w-3/4 rounded mb-2"
                  style={{ background: 'var(--stone-200)' }}
                />
                <div
                  className="h-4 w-1/2 rounded"
                  style={{ background: 'var(--stone-100)' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
