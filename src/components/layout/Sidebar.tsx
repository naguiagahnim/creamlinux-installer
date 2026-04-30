import { Icon, layers, linux, proton, settings } from '@/components/icons'
import { epic } from '@/components/icons'
import { Button } from '@/components/buttons'

interface SidebarProps {
  setFilter: (filter: string) => void
  currentFilter: string
  onSettingsClick: () => void
}

type FilterItem = {
  id: string
  label: string
  icon: string
  variant?: string
}

const Sidebar = ({ setFilter, currentFilter, onSettingsClick }: SidebarProps) => {
  const steamFilters: FilterItem[] = [
    { id: 'all', label: 'All Games', icon: layers, variant: 'solid' },
    { id: 'native', label: 'Native', icon: linux, variant: 'brand' },
    { id: 'proton', label: 'Proton', icon: proton, variant: 'brand' },
  ]

  const epicFilters: FilterItem[] = [
    { id: 'epic', label: 'All Games', icon: epic, variant: 'brand' },
  ]

  const renderFilter = (filter: FilterItem) => (
    <li
      key={filter.id}
      className={currentFilter === filter.id ? 'active' : ''}
      onClick={() => setFilter(filter.id)}
    >
      <div className="filter-item">
        <Icon name={filter.icon} variant={filter.variant} size="md" className="filter-icon" />
        <span>{filter.label}</span>
      </div>
    </li>
  )

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Library</h2>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Steam</span>
        <ul className="filter-list">
          {steamFilters.map(renderFilter)}
        </ul>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">Epic Games</span>
        <ul className="filter-list">
          {epicFilters.map(renderFilter)}
        </ul>
      </div>

      <Button
        variant="secondary"
        size="medium"
        onClick={onSettingsClick}
        className="settings-button"
        leftIcon={<Icon name={settings} variant="solid" size="md" className="settings-icon" />}
        fullWidth
      >
        Settings
      </Button>
    </div>
  )
}

export default Sidebar