/**
 * Design System Reference Page
 * Hidden page for designers and AI assistants - not visible in navigation
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyGardenIllustration, NoTasksIllustration, NoResultsIllustration } from '@/components/ui/empty-states'
import { GrowingPlantLoader, SpinningLeafLoader, PulsingDotsLoader, WateringCanLoader } from '@/components/ui/botanical-loader'
import Icon from '@/components/ui/icon'

export default function DesignSystemPage() {
  const [showTaskCelebration, setShowTaskCelebration] = useState(false)

  const triggerCelebration = () => {
    setShowTaskCelebration(true)
    setTimeout(() => setShowTaskCelebration(false), 1200)
  }

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
              'Task Actions',
              'Empty States & Loaders',
              'Image Upload',
              'Shadows & Effects',
              'Animations'
            ].map(section => (
              <li key={section}>
                <a
                  href={`#${section.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
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
              Used for primary actions, navigation, and plant-related botanical elements
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {[
                { shade: '50', hex: '#f4f7f5' },
                { shade: '100', hex: '#e4ebe6' },
                { shade: '200', hex: '#c9d7cd' },
                { shade: '300', hex: '#a3bda9' },
                { shade: '400', hex: '#7c9885' },
                { shade: '500', hex: '#5d7d66' },
                { shade: '600', hex: '#4a6552' },
                { shade: '700', hex: '#3d5244' },
                { shade: '800', hex: '#344338' },
                { shade: '900', hex: '#2d3830' },
              ].map(({ shade, hex }) => (
                <div key={shade}>
                  <div style={{
                    background: `var(--sage-${shade})`,
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>sage-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lawn Green - NEW */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Lawn Palette - Fresh Grass Green
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Used for lawn care features, mowing tasks, and grass-related elements
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {[
                { shade: '50', hex: '#f0f7f0' },
                { shade: '100', hex: '#dceddc' },
                { shade: '200', hex: '#b8dbb8' },
                { shade: '300', hex: '#8bc48b' },
                { shade: '400', hex: '#5fa85f' },
                { shade: '500', hex: '#4a9149' },
                { shade: '600', hex: '#3d7a3d' },
                { shade: '700', hex: '#336333' },
                { shade: '800', hex: '#2a4f2a' },
                { shade: '900', hex: '#234023' },
              ].map(({ shade, hex }) => (
                <div key={shade}>
                  <div style={{
                    background: `var(--lawn-${shade})`,
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>lawn-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{hex}</div>
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
              Used for accents, warmth, feeding tasks, and snooze actions
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {[
                { shade: '50', hex: '#fdf8f4' },
                { shade: '100', hex: '#f9ede3' },
                { shade: '200', hex: '#f2d9c6' },
                { shade: '300', hex: '#e8c0a0' },
                { shade: '400', hex: '#d4a47a' },
                { shade: '500', hex: '#c4895c' },
                { shade: '600', hex: '#b67347' },
                { shade: '700', hex: '#975c3b' },
                { shade: '800', hex: '#7a4d35' },
                { shade: '900', hex: '#64412f' },
              ].map(({ shade, hex }) => (
                <div key={shade}>
                  <div style={{
                    background: `var(--earth-${shade})`,
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>earth-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{hex}</div>
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
              Used for backgrounds, borders, skip actions, and subtle UI elements
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {[
                { shade: '50', hex: '#faf9f7' },
                { shade: '100', hex: '#f5f3f0' },
                { shade: '200', hex: '#e8e5e0' },
                { shade: '300', hex: '#d5d0c8' },
                { shade: '400', hex: '#b8b1a6' },
                { shade: '500', hex: '#9a9285' },
                { shade: '600', hex: '#7d756a' },
                { shade: '700', hex: '#655e55' },
                { shade: '800', hex: '#534d47' },
                { shade: '900', hex: '#46413c' },
              ].map(({ shade, hex }) => (
                <div key={shade}>
                  <div style={{
                    background: `var(--stone-${shade})`,
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    border: shade === '50' ? '1px solid var(--stone-200)' : 'none'
                  }} />
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>stone-{shade}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{hex}</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { name: 'Coral', var: '--coral', hex: '#e07a5f', usage: 'High-effort tasks, alerts' },
                { name: 'Coral Light', var: '--coral-light', hex: '#f4a593', usage: 'Subtle accents' },
                { name: 'Success', var: '--success', hex: '#5d7d66', usage: 'Success states, done' },
                { name: 'Warning', var: '--warning', hex: '#d4a47a', usage: 'Medium effort, warnings' },
                { name: 'Error', var: '--error', hex: '#c75146', usage: 'Error states, delete' },
              ].map(color => (
                <div key={color.var} style={{
                  border: '1px solid var(--stone-200)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: `var(${color.var})`,
                    height: '56px'
                  }} />
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.125rem', fontSize: '0.875rem' }}>{color.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      {color.hex}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {color.usage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Category Colors */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Task Category Colors
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Background and text color pairings for task category badges
            </p>

            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Plant Tasks
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { name: 'Pruning', bg: 'var(--sage-100)', text: 'var(--sage-700)' },
                { name: 'Feeding', bg: 'var(--earth-100)', text: 'var(--earth-700)' },
                { name: 'Pest Control', bg: 'var(--earth-50)', text: 'var(--earth-800)' },
                { name: 'Planting', bg: 'var(--sage-100)', text: 'var(--sage-700)' },
                { name: 'Watering', bg: 'var(--sage-50)', text: 'var(--sage-800)' },
                { name: 'Harvesting', bg: 'var(--earth-200)', text: 'var(--earth-900)' },
                { name: 'Winter Care', bg: 'var(--stone-200)', text: 'var(--stone-800)' },
                { name: 'General', bg: 'var(--stone-100)', text: 'var(--stone-700)' },
              ].map(cat => (
                <span
                  key={cat.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    background: cat.bg,
                    color: cat.text,
                  }}
                >
                  {cat.name}
                </span>
              ))}
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Lawn Tasks
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                { name: 'Mowing', bg: 'var(--lawn-100)', text: 'var(--lawn-700)' },
                { name: 'Aeration', bg: 'var(--earth-100)', text: 'var(--earth-700)' },
                { name: 'Scarification', bg: 'var(--earth-100)', text: 'var(--earth-700)' },
                { name: 'Overseeding', bg: 'var(--lawn-100)', text: 'var(--lawn-700)' },
                { name: 'Moss Control', bg: 'var(--stone-200)', text: 'var(--stone-700)' },
                { name: 'Weed Mgmt', bg: 'var(--earth-50)', text: 'var(--earth-800)' },
                { name: 'Edging', bg: 'var(--lawn-50)', text: 'var(--lawn-800)' },
              ].map(cat => (
                <span
                  key={cat.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    background: cat.bg,
                    color: cat.text,
                  }}
                >
                  {cat.name}
                </span>
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
                  Available in Regular, Medium, Semibold, Bold
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
                  Available in Regular, Semibold, Bold
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
                clamp(2rem, 5vw, 2.25rem) - 32px to 36px
              </p>

              <h2 style={{ marginBottom: '1rem' }}>Heading 2 - Section titles</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                clamp(1.5rem, 4vw, 1.875rem) - 24px to 30px
              </p>

              <h3 style={{ marginBottom: '1rem' }}>Heading 3 - Subsection titles</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                clamp(1.25rem, 3vw, 1.5rem) - 20px to 24px
              </p>

              <p style={{ marginBottom: '1rem' }}>Body Text - Standard paragraph text</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                1rem (16px) with line-height: 1.6
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
            Using Tailwind&apos;s default spacing scale (4px base unit)
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
              Standard Buttons
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-destructive">Destructive</button>
              <button className="btn btn-ghost">Ghost</button>
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
              <p><strong>Primary:</strong> Main actions (Save, Submit, Add) - sage-600 background</p>
              <p><strong>Secondary:</strong> Alternative actions (Cancel, Back) - stone-100 background with border</p>
              <p><strong>Destructive:</strong> Dangerous actions (Delete, Remove) - error color with subtle red background</p>
              <p><strong>Ghost:</strong> Tertiary actions - transparent background, appears on hover</p>
              <p style={{ marginTop: '0.5rem' }}>
                Padding: 12px 24px | Border Radius: 10px (radius-md) | Font: Crimson Text 500
              </p>
            </div>
          </div>

          {/* Icon Buttons */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Icon Buttons
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Square buttons for icon-only actions. Use for toolbars, card actions, and compact UI.
            </p>

            {/* Sizes */}
            <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Sizes
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-sm btn-icon-primary">
                  <Icon name="Pencil" size={16} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Small (32px)</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-primary">
                  <Icon name="Pencil" size={20} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Default (40px)</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-lg btn-icon-primary">
                  <Icon name="Pencil" size={24} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Large (48px)</p>
              </div>
            </div>

            {/* Variants */}
            <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Variants
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-primary">
                  <Icon name="Plus" size={20} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Primary</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-secondary">
                  <Icon name="Gear" size={20} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Secondary</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-destructive">
                  <Icon name="Trash" size={20} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Destructive</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button className="btn-icon btn-icon-ghost">
                  <Icon name="X" size={20} weight="light" />
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ghost</p>
              </div>
            </div>

            {/* Common use cases */}
            <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              Common Use Cases
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '1.5rem' }}>
              {/* Delete action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--stone-200)'
              }}>
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Tomato Plant</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Garden bed</p>
                </div>
                <button className="btn-icon btn-icon-destructive">
                  <Icon name="Trash" size={20} weight="light" />
                </button>
              </div>

              {/* Action toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: 'var(--stone-100)',
                borderRadius: 'var(--radius-md)'
              }}>
                <button className="btn-icon btn-icon-sm btn-icon-ghost">
                  <Icon name="Pencil" size={16} weight="light" />
                </button>
                <button className="btn-icon btn-icon-sm btn-icon-ghost">
                  <Icon name="Copy" size={16} weight="light" />
                </button>
                <button className="btn-icon btn-icon-sm btn-icon-destructive">
                  <Icon name="Trash" size={16} weight="light" />
                </button>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <p><strong>Classes:</strong> .btn-icon + .btn-icon-[variant] + optional .btn-icon-[size]</p>
              <p><strong>Sizes:</strong> sm (32px), default (40px), lg (48px)</p>
              <p><strong>Variants:</strong> primary, secondary, destructive, ghost</p>
              <p style={{ marginTop: '0.5rem' }}>Border Radius: 10px (radius-md) | Icon sizes: 16px (sm), 20px (default), 24px (lg)</p>
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
              <p>Padding: 12px 16px | Border: 1px solid stone-200</p>
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
              <p>Border Radius: 24px (radius-xl) | Shadow: shadow-md</p>
              <p>Hover: translateY(-2px) + shadow-lg (.card-hover class)</p>
            </div>
          </div>
        </section>

        {/* Task Actions - NEW */}
        <section id="task-actions" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Task Actions
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Action buttons for completing, skipping, or snoozing tasks. Each action has distinct styling and feedback.
          </p>

          {/* Task Action Buttons */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.25rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Action Button States
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {/* Done Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--sage-100)',
                  color: 'var(--sage-700)',
                }}
              >
                <Icon name="Check" size={16} weight="light" />
                Done
              </button>

              {/* Skip Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--stone-100)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Icon name="X" size={16} weight="light" />
                Skip
              </button>

              {/* Snooze Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--earth-100)',
                  color: 'var(--earth-700)',
                }}
              >
                <Icon name="Clock" size={16} weight="light" />
                Snooze
                <Icon name="CaretDown" size={12} weight="light" />
              </button>
            </div>

            {/* Lawn variant */}
            <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              Lawn Task Variant (uses lawn-* colors)
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--lawn-100)',
                  color: 'var(--lawn-700)',
                }}
              >
                <Icon name="Check" size={16} weight="light" />
                Done
              </button>
            </div>
          </div>

          {/* Celebration Animation */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.25rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Task Completion Celebration
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              When marking a task as done, a celebration overlay appears with animated checkmark and floating botanical particles.
            </p>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={triggerCelebration}
                className="btn btn-primary"
                style={{ position: 'relative', zIndex: 1 }}
              >
                Click to see celebration
              </button>
              <AnimatePresence>
                {showTaskCelebration && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                      position: 'absolute',
                      inset: '-16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 30,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: 'rgba(93, 125, 102, 0.95)',
                    }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        style={{ position: 'absolute' }}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1, 0.5],
                          x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15)],
                          y: [0, -40 - i * 10],
                        }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                      >
                        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                          <path d="M12 20V12M12 12C12 12 9 10 7 7C10 7 12 9 12 12Z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                      <svg viewBox="0 0 24 24" style={{ width: 48, height: 48 }} fill="none" stroke="white" strokeWidth="2.5">
                        <motion.path
                          d="M5 13l4 4L19 7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'var(--stone-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <p><strong>Done:</strong> sage-100 bg / sage-700 text (lawn-100/700 for lawn tasks)</p>
            <p><strong>Skip:</strong> stone-100 bg / text-secondary</p>
            <p><strong>Snooze:</strong> earth-100 bg / earth-700 text with dropdown (1 week, 2 weeks, 1 month)</p>
            <p style={{ marginTop: '0.5rem' }}><strong>Loading:</strong> Spinning border indicator | <strong>Celebration:</strong> Checkmark with floating leaves</p>
          </div>
        </section>

        {/* Empty States & Loaders - NEW */}
        <section id="empty-states-and-loaders" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Empty States & Loaders
          </h2>

          {/* Empty States */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Empty State Illustrations
            </h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Simple Phosphor icon-based illustrations for empty states. Each appears in a colored circle with entrance animation.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <EmptyGardenIllustration />
                <p style={{ marginTop: '1rem', fontWeight: '600', fontSize: '0.9375rem' }}>Empty Garden</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Flower icon in sage-100 circle</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <NoTasksIllustration />
                <p style={{ marginTop: '1rem', fontWeight: '600', fontSize: '0.9375rem' }}>No Tasks</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>CheckCircle icon in sage-100 circle</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <NoResultsIllustration />
                <p style={{ marginTop: '1rem', fontWeight: '600', fontSize: '0.9375rem' }}>No Results</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>MagnifyingGlass in stone-100 circle</p>
              </div>
            </div>
          </div>

          {/* Botanical Loaders */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Botanical Loaders
            </h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Animated SVG loaders with botanical/gardening themes. Available in sm, md, lg sizes.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '2rem',
              padding: '2rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GrowingPlantLoader size="lg" />
                </div>
                <p style={{ marginTop: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>Growing Plant</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stem grows, leaves appear, bud blooms</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SpinningLeafLoader size="lg" />
                </div>
                <p style={{ marginTop: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>Spinning Leaf</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous rotation</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PulsingDotsLoader />
                </div>
                <p style={{ marginTop: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>Pulsing Dots</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staggered scale/opacity pulse</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WateringCanLoader size="lg" />
                </div>
                <p style={{ marginTop: '0.5rem', fontWeight: '600', fontSize: '0.9375rem' }}>Watering Can</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tilting can with falling drops</p>
              </div>
            </div>
          </div>

          {/* Lawn Health Indicator */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Lawn Health Indicator
            </h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Status dots indicating lawn health. 1-3 colored dots based on health level.
            </p>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lawn-500)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lawn-500)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lawn-500)' }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Healthy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--stone-300)' }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Needs Attention</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--error)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--stone-300)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--stone-300)' }} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Struggling</span>
              </div>
            </div>
          </div>
        </section>

        {/* Image Upload - NEW */}
        <section id="image-upload" style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '2rem',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)'
          }}>
            Image Upload
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Drag-and-drop image upload component with client-side resizing, validation, and progress feedback.
          </p>

          {/* Dropzone States */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Default State */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Default State</h4>
              <div
                style={{
                  border: '2px dashed var(--stone-300)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--sage-100)',
                  }}
                >
                  <Icon name="Camera" size={24} weight="light" style={{ color: 'var(--sage-600)' }} />
                </div>
                <p style={{ fontWeight: '500', marginBottom: '4px', fontSize: '0.875rem' }}>Add a photo</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag and drop or click to browse</p>
              </div>
            </div>

            {/* Drag Active State */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Drag Active</h4>
              <div
                style={{
                  border: '2px dashed var(--sage-500)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--sage-50)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--sage-100)',
                  }}
                >
                  <Icon name="Camera" size={24} weight="light" style={{ color: 'var(--sage-600)' }} />
                </div>
                <p style={{ fontWeight: '500', marginBottom: '4px', fontSize: '0.875rem' }}>Drop image here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag and drop or click to browse</p>
              </div>
            </div>

            {/* Preview with Progress */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Uploading State</h4>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: '16px',
                    background: 'var(--stone-200)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <motion.div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          margin: '0 auto 8px',
                          border: '3px solid var(--sage-200)',
                          borderTopColor: 'var(--sage-600)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>65%</span>
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="X" size={14} weight="bold" />
                </button>
              </div>
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'var(--stone-50)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <p><strong>Accepted formats:</strong> JPEG, PNG, WebP</p>
            <p><strong>Max file size:</strong> 10MB (resized to max 1200px)</p>
            <p><strong>Drag active:</strong> sage-500 dashed border + sage-50 background</p>
            <p><strong>Progress:</strong> Spinning ring with percentage</p>
            <p><strong>Remove:</strong> Red circular button with X icon at top-right</p>
          </div>
        </section>

        {/* Shadows & Effects */}
        <section id="shadows-and-effects" style={{ marginBottom: '4rem' }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--sage-700)' }}>
                    {shadow.name}
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
                    width: '80px',
                    height: '80px',
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

          {/* Glass & Botanical Effects */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Special Effects
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--stone-200)',
              }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>.glass</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Frosted glass effect with backdrop blur
                </p>
                <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>backdrop-filter: blur(12px)</code>
              </div>
              <div className="bg-botanical" style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--stone-200)',
              }}>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>.bg-botanical</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Radial gradient overlay pattern using sage and earth
                </p>
              </div>
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

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              CSS Keyframe Animations
            </h3>
            <div style={{
              padding: '1.5rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--stone-200)'
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                <li><strong>fadeIn:</strong> Opacity 0 to 1</li>
                <li><strong>fadeInUp:</strong> Fade in + translate up 16px</li>
                <li><strong>scaleIn:</strong> Scale 0.95 to 1 with fade</li>
                <li><strong>slideInFromLeft:</strong> Slide from left 20px</li>
                <li><strong>gentlePulse:</strong> Opacity pulse 1 to 0.7 to 1</li>
                <li><strong>float:</strong> translateY floating effect (6px)</li>
              </ul>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Animation Utility Classes
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {['.animate-fade-in', '.animate-fade-in-up', '.animate-scale-in', '.animate-slide-in'].map(cls => (
                <code key={cls} style={{
                  padding: '6px 12px',
                  background: 'var(--sage-100)',
                  color: 'var(--sage-800)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                }}>
                  {cls}
                </code>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Staggered delays available: <code>.delay-1</code> through <code>.delay-6</code> (50ms increments)
            </p>
          </div>

          <div>
            <h3 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Framer Motion Patterns
            </h3>
            <div style={{
              padding: '1.5rem',
              background: 'var(--stone-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--stone-200)'
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                <li><strong>Component Entry:</strong> initial/animate/exit with opacity and Y transforms</li>
                <li><strong>Task Celebration:</strong> Checkmark with botanical particle floats</li>
                <li><strong>Dropdown/Accordion:</strong> Height and opacity transitions</li>
                <li><strong>Page Stagger:</strong> containerVariants and itemVariants for sequential reveals</li>
                <li><strong>Loading Spinners:</strong> Rotating animations with infinite repeat</li>
                <li><strong>Toast Notifications:</strong> Scale and Y translate with auto-dismiss</li>
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
          <p>Tend Design System | Last updated: {new Date().toLocaleDateString()}</p>
          <p style={{ marginTop: '0.5rem' }}>
            This page is hidden from navigation and search engines
          </p>
        </footer>
      </div>
    </div>
  )
}
