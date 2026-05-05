import { Link, useParams } from 'react-router-dom'
import './Card.css'
import { useEffect, useState } from 'react'

type CreatureData = {
  id: string | number
  Name: string
  Scientific_Name: string
  Era: string
  Period: string
  Diet: string
  Length: string
  Weight: string
  Image_URL: string
  Summary: string
}

type CreatureResponse = {
  message?: CreatureData[]
}

function formatCreatureName(value: string | undefined) {
  if (!value) {
    return 'Creature'
  }

  return decodeURIComponent(value)
    .replaceAll('-', ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function Card() {
  const { creatureName } = useParams()
  const searchedName = formatCreatureName(creatureName)
  const [creatureData, setCreatureData] = useState<CreatureData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const creature = creatureData[0]
  const displayName = creature?.Name ?? searchedName
  const titleSizeClass =
    displayName.length > 22 ? 'name-extra-long' : displayName.length > 10 ? 'name-long' : ''

  useEffect(() => {
    if (!creatureName) {
      return
    }

    fetch(`http://localhost:8000/getCreature?query=${encodeURIComponent(creatureName)}`)
      .then((response) => response.json())
      .then((data: CreatureResponse) => {
        setCreatureData(data.message ?? [])
        setErrorMessage('')
      })
      .catch((error) => {
        console.error('Error fetching creature data:', error)
        setErrorMessage('Could not load this creature. Check that the backend is running.')
        setCreatureData([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [creatureName])

  return (
    <main className="creature-page">
      <nav className="creature-nav" aria-label="Creature page navigation">
        <Link className="creature-brand" to="/">
          <span className="creature-brand-mark" aria-hidden="true">
            M
          </span>
          MesoDB
        </Link>
        <Link className="back-link" to="/">
          New search
        </Link>
      </nav>

      <section className="creature-profile" aria-labelledby="creature-title">
        <div className="creature-visual-panel">
          {creature?.Image_URL ? (
            <img className="creature-image" src={creature.Image_URL} alt={creature.Name} />
          ) : (
            <div className="image-placeholder" aria-label="No creature image available">
              <span />
            </div>
          )}
          {/* <a href={creature?.Image_URL} className="image-source-link" target="_blank" rel="noopener noreferrer">Image Credit</a> */}
        </div>

        <article className="creature-info-card">
          <p className="creature-kicker">Creature profile</p>
          <h1 className={titleSizeClass} id="creature-title">
            {displayName}
          </h1>
          {creature?.Scientific_Name && (
            <p className="scientific-name">{creature.Scientific_Name}</p>
          )}

          {isLoading && (
            <div className="status-callout" role="status">
              Loading creature data...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="status-callout is-error" role="alert">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && !creature && (
            <div className="status-callout" role="status">
              No creature found for "{searchedName}".
            </div>
          )}

          <dl className="profile-facts" aria-label="Creature facts">
            <div>
              <dt>Era</dt>
              <dd>{creature?.Era ?? 'Pending'}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{creature?.Period ?? 'Pending'}</dd>
            </div>
            <div>
              <dt>Diet</dt>
              <dd>{creature?.Diet ?? 'Pending'}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{creature?.Length ?? 'Pending'}</dd>
            </div>
            <div>
              <dt>Weight</dt>
              <dd>{creature?.Weight ?? 'Pending'}</dd>
            </div>
          </dl>

          <section className="creature-summary" aria-label="Creature summary">
            <h2>Summary</h2>
            <p>{creature?.Summary ?? 'No summary available.'}</p>
          </section>
        </article>
      </section>

      {/* <section className="detail-grid" aria-label="Detailed creature sections">
        <article>
          <span>01</span>
          <h2>Description</h2>
          <p>Overview text from the creature record will appear here.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Discovery</h2>
          <p>Fossil discovery notes, formation, and location can live here.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Ecology</h2>
          <p>Diet, habitat, behavior, and ecosystem relationships can be shown here.</p>
        </article>
      </section> */}

      <p id="image-credits"> All Images Used Are Not My Own and Are Property of Their Respective Owners </p>
    </main>
  )
}

export default Card
