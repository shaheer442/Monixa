export default function PagePlaceholder({ title, description }) {
  return (
    <section className="rounded-2xl border border-finora-border bg-finora-surface p-8 shadow-lg">
      <p className="text-sm font-medium uppercase tracking-wider text-finora-accent">
        Finora
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-2xl text-finora-text-secondary">{description}</p>
    </section>
  )
}
