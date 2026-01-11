/**
 * Design System Reference Page
 * Hidden page for designers and AI assistants - not visible in navigation
 */

export const metadata = {
  title: 'Design System - Tend',
  robots: 'noindex, nofollow',
}

export default function DesignSystemPage() {
  return (
    <div style={{
      fontFamily: 'var(--font-crimson)',
      background: 'white',
      minHeight: '100vh',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '4rem', borderBottom: '2px solid var(--stone-200)', paddingBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '3rem',
            color: 'var(--sage-700)',
            marginBottom: '0.5rem'
          }}>
            Tend Design System
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '700px'
          }}>
            Botanical Companion Aesthetic - A comprehensive reference for designers and AI assistants working on the Tend gardening app.
          </p>
        </header>

        {/* Table of Contents */}
        <nav style={{
          background: 'var(--sage-50)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '3rem'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.25rem',
            marginBottom: '1rem',
            color: 'var(--sage-700)'
          }}>
            Table of Contents
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            {[
              'Colors',
              'Typography',
              'Spacing',
              'Components',
              'Shadows & Effects',
              'Animations'
            ].map(section => (
              <li key={section}>
                <a
                  href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    color: 'var(--sage-700)',
                    textDecoration: 'none',
                    fontSize: '0.9375rem'
                  }}
                >
                  → {section}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Colors */}
        <section id="colors" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Colors
          </h2>

          {/* Primary - Sage Green */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Primary Palette - Sage Green
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Used for primary actions, navigation, and botanical elements
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(shade => (
                <div key={shade}>
                  <div style={{
                    background: `var(--sage-${shade})`,
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }} />
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>sage-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {getComputedColorValue(`--sage-${shade}`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary - Earth/Terracotta */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Secondary Palette - Earth/Terracotta
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Used for accents, warmth, and category highlights
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(shade => (
                <div key={shade}>
                  <div style={{
                    background: `var(--earth-${shade})`,
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }} />
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>earth-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {getComputedColorValue(`--earth-${shade}`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Neutrals - Stone */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Neutral Palette - Warm Stone
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Used for backgrounds, borders, and subtle UI elements
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(shade => (
                <div key={shade}>
                  <div style={{
                    background: `var(--stone-${shade})`,
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: shade === '50' ? '1px solid var(--stone-200)' : 'none'
                  }} />
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>stone-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {getComputedColorValue(`--stone-${shade}`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Semantic & Accent Colors
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Coral', var: '--coral', usage: 'Alerts, highlights' },
                { name: 'Coral Light', var: '--coral-light', usage: 'Subtle accents' },
                { name: 'Success', var: '--success', usage: 'Success states' },
                { name: 'Warning', var: '--warning', usage: 'Warning states' },
                { name: 'Error', var: '--error', usage: 'Error states' },
              ].map(color => (
                <div key={color.var} style={{
                  border: '1px solid var(--stone-200)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: `var(${color.var})`,
                    height: '80px'
                  }} />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{color.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {getComputedColorValue(color.var)}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {color.usage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section id="typography" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Typography
          </h2>

          {/* Font Families */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Font Families
            </h3>
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              <div style={{
                padding: '1.5rem',
                background: 'var(--stone-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--stone-200)'
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '2rem',
                  marginBottom: '0.5rem',
                  color: 'var(--sage-700)'
                }}>
                  Cormorant Garamond
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Display Font - Used for headings (H1-H6), titles, and branded elements
                </p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem' }}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  Available in Regular, Medium, Semibold, Bold • Italic variants
                </p>
              </div>

              <div style={{
                padding: '1.5rem',
                background: 'var(--stone-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--stone-200)'
              }}>
                <div style={{
                  fontFamily: 'var(--font-crimson)',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                  color: 'var(--sage-700)'
                }}>
                  Crimson Text
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Body Font - Used for all body text, buttons, inputs, and UI elements
                </p>
                <p style={{ fontFamily: 'var(--font-crimson)', fontSize: '1rem' }}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p style={{ fontFamily: 'var(--font-crimson)', fontSize: '0.875rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  Available in Regular, Semibold, Bold • Italic variants
                </p>
              </div>
            </div>
          </div>

          {/* Heading Scale */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Heading Scale (Responsive)
            </h3>
            <div style={{
              padding: '2rem',
              background: 'white',
              border: '1px solid var(--stone-200)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <h1 style={{ marginBottom: '1rem' }}>Heading 1 - Main page titles</h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                clamp(2rem, 5vw, 2.25rem) • 32px-36px
              </p>

              <h2 style={{ marginBottom: '1rem' }}>Heading 2 - Section titles</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                clamp(1.5rem, 4vw, 1.875rem) • 24px-30px
              </p>

              <h3 style={{ marginBottom: '1rem' }}>Heading 3 - Subsection titles</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                clamp(1.25rem, 3vw, 1.5rem) • 20px-24px
              </p>

              <p style={{ marginBottom: '1rem' }}>Body Text - Standard paragraph text</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                1rem • 16px • Line-height: 1.6
              </p>
            </div>
          </div>
        </section>

        {/* Spacing */}
        <section id="spacing" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Spacing Scale
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Using Tailwind's default spacing scale (4px base unit)
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { name: '1', size: '4px', usage: 'Minimal gaps' },
              { name: '2', size: '8px', usage: 'Small gaps' },
              { name: '3', size: '12px', usage: 'Compact spacing' },
              { name: '4', size: '16px', usage: 'Standard spacing' },
              { name: '6', size: '24px', usage: 'Medium spacing' },
              { name: '8', size: '32px', usage: 'Large spacing' },
              { name: '12', size: '48px', usage: 'Section spacing' },
              { name: '16', size: '64px', usage: 'Major sections' },
            ].map(space => (
              <div key={space.name} style={{
                padding: '1rem',
                background: 'var(--stone-50)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--stone-200)'
              }}>
                <div style={{
                  background: 'var(--sage-600)',
                  height: space.size,
                  width: space.size,
                  marginBottom: '0.75rem',
                  borderRadius: '4px'
                }} />
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{space.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{space.size}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {space.usage}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Components */}
        <section id="components" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Components
          </h2>

          {/* Buttons */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Buttons
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Disabled
              </button>
            </div>
            <div style={{
              padding: '1rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <p><strong>Primary:</strong> Main actions (Save, Submit, Add)</p>
              <p><strong>Secondary:</strong> Alternative actions (Cancel, Back)</p>
              <p style={{ marginTop: '0.5rem' }}>
                Padding: 12px 24px • Border Radius: 10px • Font: Crimson Text 500
              </p>
            </div>
          </div>

          {/* Inputs */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Form Inputs
            </h3>
            <div style={{ maxWidth: '400px', marginBottom: '1rem' }}>
              <label className="label">Label Text</label>
              <input className="input" type="text" placeholder="Placeholder text..." />
            </div>
            <div style={{ maxWidth: '400px', marginBottom: '1rem' }}>
              <label className="label">Focused State</label>
              <input className="input" type="text" value="Focused input" readOnly style={{
                borderColor: 'var(--sage-400)',
                boxShadow: '0 0 0 3px rgba(124, 152, 133, 0.15)'
              }} />
            </div>
            <div style={{
              padding: '1rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <p>Padding: 12px 16px • Border: 1px solid stone-200</p>
              <p>Focus: sage-400 border with sage shadow ring</p>
            </div>
          </div>

          {/* Cards */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Cards
            </h3>
            <div style={{
              maxWidth: '400px',
              background: 'white',
              padding: '1.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.25rem',
                marginBottom: '0.5rem'
              }}>
                Card Title
              </h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Card content goes here. Cards use shadow-md and rounded corners.
              </p>
              <button className="btn btn-primary">Card Action</button>
            </div>
            <div style={{
              padding: '1rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <p>Border Radius: 24px (radius-xl) • Shadow: shadow-md</p>
              <p>Hover: translateY(-2px) + shadow-lg</p>
            </div>
          </div>
        </section>

        {/* Shadows & Effects */}
        <section id="shadows-&-effects" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Shadows & Effects
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { name: 'Small', var: 'var(--shadow-sm)', value: '0 1px 2px rgba(45, 59, 54, 0.05)' },
              { name: 'Medium', var: 'var(--shadow-md)', value: '0 4px 12px rgba(45, 59, 54, 0.08)' },
              { name: 'Large', var: 'var(--shadow-lg)', value: '0 8px 24px rgba(45, 59, 54, 0.12)' },
              { name: 'Extra Large', var: 'var(--shadow-xl)', value: '0 16px 48px rgba(45, 59, 54, 0.16)' },
            ].map(shadow => (
              <div key={shadow.name}>
                <div style={{
                  background: 'white',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: shadow.var,
                  marginBottom: '1rem',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--sage-700)' }}>
                    {shadow.name} Shadow
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {shadow.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Border Radius
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { name: 'Small', var: '--radius-sm', value: '6px' },
                { name: 'Medium', var: '--radius-md', value: '10px' },
                { name: 'Large', var: '--radius-lg', value: '16px' },
                { name: 'Extra Large', var: '--radius-xl', value: '24px' },
              ].map(radius => (
                <div key={radius.name} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'var(--sage-200)',
                    borderRadius: `var(${radius.var})`,
                    marginBottom: '0.5rem'
                  }} />
                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{radius.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{radius.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Animations */}
        <section id="animations" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Animations
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Transition Speeds
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { name: 'Fast', var: '--transition-fast', value: '150ms' },
                { name: 'Base', var: '--transition-base', value: '250ms' },
                { name: 'Slow', var: '--transition-slow', value: '400ms' },
              ].map(transition => (
                <div key={transition.name} style={{
                  padding: '1rem',
                  background: 'var(--stone-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--stone-200)'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{transition.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{transition.value} ease</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Key Animations
            </h3>
            <div style={{
              padding: '1.5rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--stone-200)'
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>fadeIn:</strong> Opacity 0 → 1
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>fadeInUp:</strong> Fade in + translate up 16px
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>scaleIn:</strong> Scale 0.95 → 1 with fade
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>slideInFromLeft:</strong> Slide from left 20px
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Card Hover:</strong> translateY(-2px) + shadow upgrade
                </li>
                <li>
                  <strong>Framer Motion:</strong> Used extensively for page transitions and interactive elements
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '2px solid var(--stone-200)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}>
          <p>Tend Design System • Last updated: {new Date().toLocaleDateString()}</p>
          <p style={{ marginTop: '0.5rem' }}>
            This page is hidden from navigation and search engines
          </p>
        </footer>
      </div>
    </div>
  )
}

function getComputedColorValue(cssVar: string): string {
  // This is a placeholder - in actual runtime, this would compute the hex value
  // For now, return the variable name
  return cssVar
}
