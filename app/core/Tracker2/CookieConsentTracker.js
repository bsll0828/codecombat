import cookieconsent from 'cookieconsent'
import 'cookieconsent/build/cookieconsent.min.css'

import BaseTracker from './BaseTracker'

/**
 * Not a true tracker in that this tracker does not report data but instead
 * prompts the user to consent to tracking.  It shares the same initialization
 * and event emitter characteristics of a tracker.
 */
export default class CookieConsentTracker extends BaseTracker {
  constructor (store) {
    super()

    this.store = store
    this.loadStatus(undefined)
  }

  /**
   * Requires that user locale has already been loaded on the page
   */
  _initializeTracker () {
    if (!this.store.getters['me/inEU']) {
      this.onInitializeSuccess()
      return
    }

    window.cookieconsent.initialise({
      onInitialise: this.onStatusChange.bind(this),
      onStatusChange: this.onStatusChange.bind(this),

      container: document.body,

      palette: {
        popup: { background: '#000' },
        button: { background: "#f1d600"
        }
      },

      hasTransition: false,
      revokeable: true,
      law: false,
      location: false,
      type: 'opt-out',

      content: {
        message: $.i18n.t('legal.cookies_message'),
        dismiss: $.i18n.t('general.accept'),
        deny: $.i18n.t('legal.cookies_deny'),
        link: $.i18n.t('nav.privacy'),
        href: '/privacy'
      }
    })

    this.onInitializeSuccess()
  }

  getStatus () {
    return this.status
  }

  loadStatus (status) {
    this.status = {
      answered: typeof status === 'string',
      consented: status === 'allow' || status === 'dismiss',
      declined: status === 'deny'
    }
  }

  onStatusChange (status) {
    this.loadStatus(status)
    this.emit('change', this.getStatus())
  }
}
