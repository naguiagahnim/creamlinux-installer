/**
 * Epic game discovered via Heroic/Legendary
 */
export interface EpicGame {
  app_name: string
  title: string
  install_path: string
  executable: string
  box_art_url: string | null
  scream_installed: boolean
  koaloader_installed: boolean
  proxy_fallback_used: boolean
}