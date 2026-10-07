function ScoreCard({ title, score, subtitle }) {
  return (
    <article className="score-card">
      <div
        className="score-ring"
        style={{ background: `conic-gradient(#4f46e5 ${score}%, #e5e7eb 0)` }}
      >
        <span>{score}%</span>
      </div>
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </article>
  )
}

export default ScoreCard
