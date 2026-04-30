import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogActions,
} from '@/components/dialogs'
import { Button, AnimatedCheckbox } from '@/components/buttons'
import { Dropdown, DropdownOption } from '@/components/common'

interface ScreamAPIConfig {
  $schema: string
  $version: number
  logging: boolean
  log_eos: boolean
  block_metrics: boolean
  namespace_id: string
  default_dlc_status: 'unlocked' | 'locked' | 'original'
  override_dlc_status: Record<string, string>
  extra_graphql_endpoints: string[]
  extra_entitlements: Record<string, string>
}

interface ScreamAPISettingsDialogProps {
  visible: boolean
  onClose: () => void
  gamePath: string
  gameTitle: string
}

const DEFAULT_CONFIG: ScreamAPIConfig = {
  $schema:
    'https://raw.githubusercontent.com/acidicoala/ScreamAPI/master/res/ScreamAPI.schema.json',
  $version: 3,
  logging: false,
  log_eos: false,
  block_metrics: false,
  namespace_id: '',
  default_dlc_status: 'unlocked',
  override_dlc_status: {},
  extra_graphql_endpoints: [],
  extra_entitlements: {},
}

const DLC_STATUS_OPTIONS: DropdownOption<'unlocked' | 'locked' | 'original'>[] = [
  { value: 'unlocked', label: 'Unlocked' },
  { value: 'locked', label: 'Locked' },
  { value: 'original', label: 'Original' },
]

const ScreamAPISettingsDialog = ({
  visible,
  onClose,
  gamePath,
  gameTitle,
}: ScreamAPISettingsDialogProps) => {
  const [enabled, setEnabled] = useState(false)
  const [config, setConfig] = useState<ScreamAPIConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    try {
      const existingConfig = await invoke<ScreamAPIConfig | null>('read_screamapi_config', {
        gamePath,
      })
      if (existingConfig) {
        setConfig(existingConfig)
        setEnabled(true)
      } else {
        setConfig(DEFAULT_CONFIG)
        setEnabled(false)
      }
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to load ScreamAPI config:', error)
      setConfig(DEFAULT_CONFIG)
      setEnabled(false)
    } finally {
      setIsLoading(false)
    }
  }, [gamePath])

  useEffect(() => {
    if (visible && gamePath) {
      loadConfig()
    }
  }, [visible, gamePath, loadConfig])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (enabled) {
        await invoke('write_screamapi_config', { gamePath, config })
      } else {
        await invoke('delete_screamapi_config', { gamePath })
      }
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Failed to save ScreamAPI config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setHasChanges(false)
    onClose()
  }

  const updateConfig = <K extends keyof ScreamAPIConfig>(key: K, value: ScreamAPIConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  return (
    <Dialog visible={visible} onClose={handleCancel} size="medium">
      <DialogHeader onClose={handleCancel} hideCloseButton={true}>
        <div className="settings-header">
          <h3>ScreamAPI Settings</h3>
        </div>
        <p className="dialog-subtitle">{gameTitle}</p>
      </DialogHeader>

      <DialogBody>
        <div className="smokeapi-settings-content">
          <div className="settings-section">
            <AnimatedCheckbox
              checked={enabled}
              onChange={() => {
                setEnabled(!enabled)
                setHasChanges(true)
              }}
              label="Enable ScreamAPI Configuration"
              sublabel="Enable this to customise ScreamAPI settings for this game"
            />
          </div>

          <div className={`settings-options ${!enabled ? 'disabled' : ''}`}>
            <div className="settings-section">
              <h4>General Settings</h4>

              <Dropdown
                label="Default DLC Status"
                description="Specifies the default DLC unlock status"
                value={config.default_dlc_status}
                options={DLC_STATUS_OPTIONS}
                onChange={(value) => updateConfig('default_dlc_status', value)}
                disabled={!enabled}
              />
            </div>

            <div className="settings-section">
              <h4>Logging</h4>

              <div className="checkbox-option">
                <AnimatedCheckbox
                  checked={config.logging}
                  onChange={() => updateConfig('logging', !config.logging)}
                  label="Enable Logging"
                  sublabel="Enables logging to ScreamAPI.log.log file"
                />
              </div>

              <div className="checkbox-option">
                <AnimatedCheckbox
                  checked={config.log_eos}
                  onChange={() => updateConfig('log_eos', !config.log_eos)}
                  label="Log EOS SDK"
                  sublabel="Intercept and log EOS SDK calls (requires logging enabled)"
                />
              </div>
            </div>

            <div className="settings-section">
              <h4>Privacy</h4>

              <div className="checkbox-option">
                <AnimatedCheckbox
                  checked={config.block_metrics}
                  onChange={() => updateConfig('block_metrics', !config.block_metrics)}
                  label="Block Metrics"
                  sublabel="Block game analytics/usage reporting to Epic Online Services"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <DialogActions>
          <Button variant="secondary" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading || !hasChanges}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </DialogFooter>
    </Dialog>
  )
}

export default ScreamAPISettingsDialog