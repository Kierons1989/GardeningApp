'use client'

export default function PlantListSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div
              className="h-10 w-36 rounded-lg mb-2"
              style={{ background: 'var(--stone-200)' }}
            />
            <div
              className="h-5 w-24 rounded-lg"
              style={{ background: 'var(--stone-100)' }}
            />
          </div>
          <div
            className="h-10 w-28 rounded-lg"
            style={{ background: 'var(--sage-200)' }}
          />
        </div>

        {/* Search bar skeleton */}
        <div
          className="h-12 w-full rounded-lg"
          style={{ background: 'var(--stone-100)' }}
        />
      </div>

      {/* Plant cards skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl p-6"
            style={{ background: 'white', border: '1px solid var(--stone-100)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl"
                style={{ background: 'var(--stone-200)' }}
              />
              <div className="flex-1">
                <div
                  className="h-5 w-3/4 rounded mb-2"
                  style={{ background: 'var(--stone-200)' }}
                />
                <div
                  className="h-4 w-1/2 rounded mb-3"
                  style={{ background: 'var(--stone-100)' }}
                />
                <div className="flex gap-2">
                  <div
                    className="h-6 w-16 rounded-full"
                    style={{ background: 'var(--stone-100)' }}
                  />
                  <div
                    className="h-6 w-20 rounded-full"
                    style={{ background: 'var(--stone-100)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
