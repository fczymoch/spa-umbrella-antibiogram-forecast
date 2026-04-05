interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '🔍', title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">{icon}</span>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {action}
    </div>
  )
}
