import React from 'react'
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogActions,
} from '@/components/dialogs'
import { Button } from '@/components/buttons'
import { Icon, info } from '@/components/icons'
import { EpicGame } from '@/types/EpicGame'

export interface EpicUnlockerSelectionDialogProps {
  visible: boolean
  game: EpicGame | null
  onClose: () => void
  onSelectScreamAPI: () => void
  onSelectKoaloader: () => void
}

/**
 * Unlocker selection dialog for Epic games.
 * Recommended: ScreamAPI (direct EOSSDK replacement).
 * Alternative: Koaloader + ScreamAPI (proxy DLL injection).
 */
const EpicUnlockerSelectionDialog: React.FC<EpicUnlockerSelectionDialogProps> = ({
  visible,
  game,
  onClose,
  onSelectScreamAPI,
  onSelectKoaloader,
}) => {
  return (
    <Dialog visible={visible} onClose={onClose} size="medium">
      <DialogHeader onClose={onClose} hideCloseButton={true}>
        <div className="unlocker-selection-header">
          <h3>Choose Unlocker</h3>
        </div>
      </DialogHeader>

      <DialogBody>
        <div className="unlocker-selection-content">
          <p className="game-title-info">
            Select which unlocker to install for <strong>{game?.title}</strong>:
          </p>

          <div className="unlocker-options">
            <div className="unlocker-option recommended">
              <div className="option-header">
                <h4>ScreamAPI</h4>
                <span className="recommended-badge">Recommended</span>
              </div>
              <p className="option-description">
                Replaces the EOS SDK DLL directly with ScreamAPI. Works for most Epic games and
                requires no additional files. DLC unlocking is automatic.
              </p>
              <Button variant="primary" onClick={onSelectScreamAPI} fullWidth>
                Install ScreamAPI
              </Button>
            </div>

            <div className="unlocker-option">
              <div className="option-header">
                <h4>Koaloader + ScreamAPI</h4>
                <span className="alternative-badge">Alternative</span>
              </div>
              <p className="option-description">
                Uses a proxy DLL to inject ScreamAPI without modifying the EOS SDK. Try this if the
                recommended method doesn't work for your game.
              </p>
              <Button variant="secondary" onClick={onSelectKoaloader} fullWidth>
                Install Koaloader
              </Button>
            </div>
          </div>

          <div className="selection-info">
            <Icon name={info} variant="solid" size="md" />
            <span>
              You can always uninstall and try the other option if one doesn't work properly.
            </span>
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <DialogActions>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </DialogFooter>
    </Dialog>
  )
}

export default EpicUnlockerSelectionDialog