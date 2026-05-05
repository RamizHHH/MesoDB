import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'

const periods = ['All', 'Triassic', 'Jurassic', 'Cretaceous'] as const
const featuredPeriods = ['Triassic', 'Jurassic', 'Cretaceous'] as const

type Creature = {
  id: string | number
  Name: string
  Scientific_Name?: string
  Era?: string
  Period?: string
  Diet?: string
  Length?: string
  Weight?: string
  Image_URL?: string
  Summary?: string
}

type CreatureResponse = {
  message?: Creature[]
}

type FeaturedSlot = {
  period: (typeof featuredPeriods)[number]
  creature?: Creature
}

function getDailySeed() {
  return new Date().toLocaleDateString('en-CA')
}

function getSeededIndex(seed: string, period: string, length: number) {
  let hash = 0
  const seedValue = `${seed}-${period}`

  for (let index = 0; index < seedValue.length; index += 1) {
    hash = (hash * 31 + seedValue.charCodeAt(index)) % 2147483647
  }

  return hash % length
}

function getCreaturePeriod(creature: Creature) {
  return creature.Period ?? creature.Era ?? ''
}

function creatureMatchesPeriod(creature: Creature, period: string) {
  return getCreaturePeriod(creature).toLowerCase().includes(period.toLowerCase())
}

function getDailyFeaturedSlots(creatures: Creature[]): FeaturedSlot[] {
  const todaySeed = getDailySeed()

  return featuredPeriods.map((period) => {
    const periodCreatures = creatures.filter((creature) => creatureMatchesPeriod(creature, period))

    if (periodCreatures.length === 0) {
      return { period }
    }

    return {
      period,
      creature: periodCreatures[getSeededIndex(todaySeed, period, periodCreatures.length)],
    }
  })
}

function Home() {
  const [activePeriod, setActivePeriod] = useState<(typeof periods)[number]>('All')
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [featuredError, setFeaturedError] = useState('')
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const featuredSlots = useMemo(() => {
    const dailySlots = getDailyFeaturedSlots(creatures)

    if (activePeriod === 'All') {
      return dailySlots
    }

    return dailySlots.filter((slot) => slot.period === activePeriod)
  }, [activePeriod, creatures])

  useEffect(() => {
    fetch('http://localhost:8000/getCreature?query=')
      .then((response) => response.json())
      .then((data: CreatureResponse) => {
        setCreatures(data.message ?? [])
        setFeaturedError('')
      })
      .catch((error) => {
        console.error('Error fetching featured creatures:', error)
        setFeaturedError('Could not load featured creatures. Check that the backend is running.')
        setCreatures([])
      })
      .finally(() => {
        setIsFeaturedLoading(false)
      })
  }, [])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedSearch = searchTerm.trim()

    if (normalizedSearch.length === 0) {
      return
    }

    navigate(`/creature/${encodeURIComponent(normalizedSearch)}`)
  }

  return (
    <main className="home-page">
      <nav className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="/">
          {/* <span className="brand-mark" aria-hidden="true">M</span> */}
          <img src="MesoDB_logo.svg" alt="MesoDB logo" className="brand-logo" />
          MesoDB
        </a>
        <div className="nav-links">
          <a href="#browse">Browse</a>
          <a href="#timeline">Timeline</a>
          <a href="#featured">Featured</a>
        </div>
      </nav>

      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">Mesozoic creature index</p>
          <h1 id="home-title">MesoDB</h1>
          <p className="hero-description">
            Explore dinosaurs, marine reptiles, pterosaurs, and early mammals from the Triassic,
            Jurassic, and Cretaceous periods.
          </p>

          <form
            className="search-panel"
            onSubmit={handleSearch}
            role="search"
            aria-label="Search MesoDB"
          >
            <label htmlFor="creature-search">Search the database</label>
            <div className="search-row">
              <input
                id="creature-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Try T. rex, Jurassic, herbivore..."
              />
              <button type="submit">Search</button>
            </div>
          </form>

          <div className="hero-stats" aria-label="Database highlights">
            <div>
              <strong>186M</strong>
              <span>years covered</span>
            </div>
            <div>
              <strong>3</strong>
              <span>major periods</span>
            </div>
            <div>
              <strong>42+</strong>
              <span>profiles planned</span>
            </div>
          </div>
        </div>
      </section>

      <section className="timeline-band" id="timeline" aria-labelledby="timeline-title">
        <div>
          <p className="eyebrow">Browse by time</p>
          <h2 id="timeline-title">The Mesozoic Era</h2>
        </div>
        <div className="period-track" aria-label="Mesozoic timeline">
          <span>Triassic</span>
          <span>Jurassic</span>
          <span>Cretaceous</span>
        </div>
      </section>

      <section className="content-section" id="featured" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured entries</p>
            <h2 id="featured-title">Start Exploring</h2>
          </div>
          <div className="period-filters" aria-label="Filter by period">
            {periods.map((period) => (
              <button
                className={period === activePeriod ? 'is-active' : ''}
                key={period}
                onClick={() => setActivePeriod(period)} 
                type="button"
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {isFeaturedLoading && (
          <div className="creature-empty-state">
            <div className="creature-art stone" aria-hidden="true">
              <span />
            </div>
            <div>
              <h3>Loading today&apos;s featured creatures</h3>
              <p>Picking one creature from each Mesozoic period.</p>
            </div>
          </div>
        )}

        {!isFeaturedLoading && featuredError && (
          <div className="creature-empty-state">
            <div className="creature-art stone" aria-hidden="true">
              <span />
            </div>
            <div>
              <h3>Featured creatures unavailable</h3>
              <p>{featuredError}</p>
            </div>
          </div>
        )}

        {!isFeaturedLoading && !featuredError && featuredSlots.length === 0 && (
          <div className="creature-empty-state">
            <div className="creature-art stone" aria-hidden="true">
              <span />
            </div>
            <div>
              <h3>No featured creatures found</h3>
              <p>Add creatures with Triassic, Jurassic, and Cretaceous period values.</p>
            </div>
          </div>
        )}

        {!isFeaturedLoading && !featuredError && featuredSlots.length > 0 && (
          <div className={`creature-grid ${featuredSlots.length === 1 ? 'is-single' : ''}`}>
            {featuredSlots.map(({ creature, period }) =>
              creature ? (
                <Link
                  className="creature-card"
                  key={creature.id}
                  to={`/creature/${encodeURIComponent(creature.Name)}`}
                >
                  <div className="featured-image-panel">
                    {creature.Image_URL ? (
                      <img src={creature.Image_URL} alt={creature.Name} />
                    ) : (
                      <div className="creature-art stone" aria-hidden="true">
                        <span />
                      </div>
                    )}
                  </div>
                  <div className="creature-card-body">
                    <div className="creature-meta">
                      <span>{getCreaturePeriod(creature) || period}</span>
                      <span>{creature.Diet || 'Diet pending'}</span>
                    </div>
                    <h3>{creature.Name}</h3>
                    {creature.Scientific_Name && (
                      <p className="featured-scientific-name">{creature.Scientific_Name}</p>
                    )}
                    <p>{creature.Summary || 'Summary coming soon.'}</p>
                    <dl className="creature-facts">
                      <div>
                        <dt>Length</dt>
                        <dd>{creature.Length || 'Pending'}</dd>
                      </div>
                      <div>
                        <dt>Weight</dt>
                        <dd>{creature.Weight || 'Pending'}</dd>
                      </div>
                    </dl>
                  </div>
                </Link>
              ) : (
                <article className="creature-card is-unavailable" key={period}>
                  <div className="featured-image-panel">
                    <div className="creature-art stone" aria-hidden="true">
                      <span />
                    </div>
                  </div>
                  <div className="creature-card-body">
                    <div className="creature-meta">
                      <span>{period}</span>
                      <span>Pending</span>
                    </div>
                    <h3>{period} feature</h3>
                    <p>Add a {period} creature to the database to fill this daily feature slot.</p>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      <section className="browse-section" id="browse" aria-labelledby="browse-title">
        <p className="eyebrow">Database paths</p>
        <h2 id="browse-title">Browse Collections</h2>
        <div className="collection-grid">
          <a href="#featured">Land giants</a>
          <a href="#featured">Marine reptiles</a>
          <a href="#featured">Flying reptiles</a>
          <a href="#featured">Early mammals</a>
        </div>
      </section>
    </main>
  )
}

export default Home
