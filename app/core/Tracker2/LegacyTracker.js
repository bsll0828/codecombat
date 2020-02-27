import CocoLegacyTracker from '../Tracker'
import BaseTracker from './BaseTracker'

/**
 * Acts as a proxy between our new tracker and our legacy Tracker.coffee
 * which still handles segment.io and GA tracking.  This tracker also binds
 * application events to the legacy tracker and exposes legacy tracker methods
 * externally as necessary.
 *
 * TODO remove this tracker when tracker refactor is complete.
 */
export default class LegacyTracker extends BaseTracker {
  constructor (topLevelTracker, store, cookieConsent) {
    super()

    // NOTE this is a temporary work around to keep all legacy tracker logic in one place
    // and out of the new top level tracker.  Sub trackers should not know about the top
    // level tracker.  This will only be in place as long as the legacy tracker is in use.
    this.topLevelTracker = topLevelTracker

    this.store = store
    this.cookieConsent = cookieConsent
  }

  async _initializeTracker () {
    this.legacyTracker = new CocoLegacyTracker()

    this.cookieConsent.on('change', () => {
      this.legacyTracker.cookies = this.cookieConsent.getStatus()
    })

    this.store.watch(
      (state) => state.me.role,
      () => this.legacyTracker.updateRole()
    )

    this.legacyTracker.finishInitialization()

    // Temporarily expose updateTrialRequestData method so it can be used during singup
    //
    // TODO refactor this to either subscribe to store changes or call a different method
    //      on top level tracker.  Likely should be an explicit call to identify when the
    //      user auth state / trial request state changes.
    this.topLevelTracker.updateTrialRequestData = this.legacyTracker.updateTrialRequestData

    this.onInitializeSuccess()
  }

  async identify (traits = {}) {
    this.legacyTracker.identify(traits)
  }

  async trackPageView (includeIntegrations = {}) {
    this.legacyTracker.trackPageView(includeIntegrations)
  }

  async trackEvent (action, properties = {}, includeIntegrations = {}) {
    this.legacyTracker.trackEvent(action, properties, includeIntegrations)
  }

  async trackTiming (duration, category, variable, label) {
    this.legacyTracker.trackTiming(duration, category, variable, label)
  }
}
