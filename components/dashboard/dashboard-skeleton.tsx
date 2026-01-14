'use client'

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Section */}
      <div className="mb-8">
        <div
          className="h-12 w-72 rounded-lg mb-3"
          style={{ background: 'var(--stone-200)' }}
        />
        <div
          className="h-5 w-48 rounded-lg mb-4"
          style={{ background: 'var(--stone-100)' }}
        />
        {/* Season badge */}
        <div
          className="h-16 w-80 rounded-xl"
          style={{ background: 'var(--stone-100)' }}
        />
      </div>

      {/* Today's Focus Section */}
      <div className="mb-8">
        <div
          className="h-6 w-32 rounded-lg mb-4"
          style={{ background: 'var(--stone-200)' }}
        />
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: 'white', border: '1px solid var(--stone-100)' }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image placeholder */}
            <div
              className="w-full md:w-40 h-32 md:h-40 rounded-xl"
              style={{ background: 'var(--stone-100)' }}
            />
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg"
                  style={{ background: 'var(--stone-200)' }}
                />
                <div>
                  <div
                    className="h-6 w-48 rounded-lg mb-2"
                    style={{ background: 'var(--stone-200)' }}
                  />
                  <div
                    className="h-4 w-32 rounded"
                    style={{ background: 'var(--stone-100)' }}
                  />
                </div>
              </div>
              <div
                className="h-4 w-full rounded mb-2"
                style={{ background: 'var(--stone-100)' }}
              />
              <div
                className="h-4 w-3/4 rounded mb-4"
                style={{ background: 'var(--stone-100)' }}
              />
              {/* Action buttons */}
              <div className="flex gap-2">
                <div
                  className="h-9 w-20 rounded-lg"
                  style={{ background: 'var(--stone-100)' }}
                />
                <div
                  className="h-9 w-16 rounded-lg"
                  style={{ background: 'var(--stone-100)' }}
                />
                <div
                  className="h-9 w-24 rounded-lg"
                  style={{ background: 'var(--stone-100)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* This Week Section - Horizontal scroll */}
      <div className="mb-8">
        <div
          className="h-6 w-28 rounded-lg mb-4"
          style={{ background: 'var(--stone-200)' }}
        />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] rounded-xl p-5"
              style={{ background: 'white', border: '1px solid var(--stone-100)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg"
                  style={{ background: 'var(--stone-200)' }}
                />
                <div className="flex-1">
                  <div
                    className="h-4 w-full rounded mb-1"
                    style={{ background: 'var(--stone-200)' }}
                  />
                  <div
                    className="h-3 w-24 rounded"
                    style={{ background: 'var(--stone-100)' }}
                  />
                </div>
              </div>
              <div
                className="h-3 w-full rounded mb-1"
                style={{ background: 'var(--stone-100)' }}
              />
              <div
                className="h-3 w-3/4 rounded mb-4"
                style={{ background: 'var(--stone-100)' }}
              />
              <div className="flex gap-1.5">
                <div
                  className="h-8 w-16 rounded-lg"
                  style={{ background: 'var(--stone-100)' }}
                />
                <div
                  className="h-8 w-14 rounded-lg"
                  style={{ background: 'var(--stone-100)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Garden Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div
            className="h-6 w-28 rounded-lg mb-4"
            style={{ background: 'var(--stone-200)' }}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ background: 'white', border: '1px solid var(--stone-100)' }}
              >
                <div
                  className="aspect-[4/3]"
                  style={{ background: 'var(--stone-100)' }}
                />
                <div className="p-3">
                  <div
                    className="h-4 w-3/4 rounded mb-1"
                    style={{ background: 'var(--stone-200)' }}
                  />
                  <div
                    className="h-3 w-1/2 rounded"
                    style={{ background: 'var(--stone-100)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lawn widget skeleton */}
        <div>
          <div
            className="rounded-xl p-4"
            style={{ background: 'white', border: '1px solid var(--stone-100)' }}
          >
            <div
              className="h-5 w-24 rounded mb-3"
              style={{ background: 'var(--stone-200)' }}
            />
            <div
              className="h-4 w-full rounded mb-2"
              style={{ background: 'var(--stone-100)' }}
            />
            <div
              className="h-4 w-3/4 rounded"
              style={{ background: 'var(--stone-100)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
