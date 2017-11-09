import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { inject } from '@ember/service';
import { getOwner } from '@ember/application';

export default Mixin.create({
  scheduler: inject('scheduler'),
  service: inject('router-scroll'),

  isFastBoot: computed(function() {
    const fastboot = getOwner(this).lookup('service:fastboot');
    return fastboot ? fastboot.get('isFastBoot') : false;
  }),

  willTransition(transitions, ...args) {
    this._super(transitions, ...args);
    let scrollElement = transitions[transitions.length - 1]
      .handler.controller.get('scrollElement');
    get(this, 'service').update(scrollElement && decodeURIComponent(scrollElement));
  },

  didTransition(transitions, ...args) {
    this._super(transitions, ...args);

		if (get(this, 'isFastBoot')) { return; }

    this.get('scheduler').scheduleWork('afterContentPaint', () => {
      this.updateScrollPosition(transitions);
    });
  },

  updateScrollPosition(transitions) {
    let scrollPosition = get(this, 'service.position');
    let controller = transitions[transitions.length - 1]
      .handler.controller;

    let preserveScrollPosition = controller.get('preserveScrollPosition');
    let scrollElement = controller.get('preserveScrollPosition') || get(this, 'service.scrollElement');

    if (!preserveScrollPosition) {
      if ('window' === scrollElement) {
        window.scrollTo(scrollPosition.x, scrollPosition.y);
      } else if ('#' === scrollElement.charAt(0)) {
        let element = document.getElementById(scrollElement.substring(1));

        if (element) {
          element.scrollLeft = scrollPosition.x;
          element.scrollTop = scrollPosition.y;
        }
      }
    }
  }
});
