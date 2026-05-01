/* ============================================
   infocard.js — Rich Info Card / Tooltip
   ============================================

   A large, non-obscuring tooltip that tracks the cursor vertically
   with "optical stability" and positions itself horizontally on
   whichever side gives the most room.

   OPTICAL STABILITY:
     The card's top edge maps linearly from the cursor's Y:
       cardTop = cursorY × (viewportH − cardH) / viewportH
     So the card follows the cursor vertically, always fully on-screen,
     and roughly at the same vertical level as what you're looking at.

   HORIZONTAL POSITIONING:
     An anchor (center of a nominated element, or viewport center)
     defines two candidate X positions — one left, one right.
     Each is pushed toward the screen edge but capped so the card's
     near edge is at most  1.1 × max(200, cardWidth)  from the anchor.
     The side farther from the cursor is chosen, with a delayed swap.

   DELAYS / HYSTERESIS:
     Vertical tracking is immediate. Side-swap, content update, and
     show/hide all have configurable delays (default 0.1s) so the
     card doesn't flicker during fast cursor movement and you can
     move the cursor onto the card to interact with links, etc.

   Usage:

     InfoCard.init({
       anchor: '#my-panel',            // optional CSS selector or element
       width: 320,                     // initial width in px
       height: 400,                    // initial height in px
       content: (el, x, y) => {        // called on mousemove (throttled)
         if (!el) return '';
         return el.dataset.tip || '';   // return HTML string; '' = hide
       },
       // All delays in ms:
       sideSwapDelay: 100,
       contentUpdateDelay: 100,
       hideDelay: 300,
       showDelay: 100,
       callbackThrottle: 100,
     });

     InfoCard.destroy();               // tear down
*/

// ============================================================
// STYLES
// ============================================================

const INFOCARD_STYLES = `
  .infocard {
    position: fixed;
    border-radius: 8px;
    z-index: 9998;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    resize: both;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #c8cdd8;
    font-size: 13px;
    line-height: 1.55;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    box-sizing: border-box;

    /* Glass surface */
    background: rgba(18, 18, 42, 0.94);
    border: 1px solid rgba(79, 195, 247, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45),
                0 0 0 1px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);

    min-width: 180px;
    min-height: 80px;
  }
  .infocard.visible {
    opacity: 1;
    pointer-events: auto;
  }
  .infocard.pinned {
    border-color: rgba(79, 195, 247, 0.45);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45),
                0 0 0 1px rgba(79, 195, 247, 0.15);
  }

  /* ── Header (drag handle + pin) ─────────────── */
  .infocard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3px 6px 3px 10px;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    border-bottom: 1px solid rgba(79, 195, 247, 0.1);
    flex-shrink: 0;
    min-height: 24px;
  }
  .infocard-header:active { cursor: grabbing; }

  .infocard-drag-hint {
    font-size: 9px;
    letter-spacing: 2px;
    opacity: 0.25;
    color: #b0b8c8;
  }

  .infocard-pin {
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 5px;
    border-radius: 4px;
    opacity: 0.4;
    transition: opacity 0.15s, background 0.15s, transform 0.2s;
    line-height: 0;
    transform: rotate(45deg);
  }
  .infocard-pin:hover {
    opacity: 0.85;
    background: rgba(79, 195, 247, 0.08);
  }
  .infocard-pin.pinned {
    opacity: 1;
    transform: rotate(0deg);
  }
  .infocard-pin svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
  .infocard-pin { color: #8090a8; }
  .infocard-pin.pinned { color: #4fc3f7; }

  /* ── Content ────────────────────────────────── */
  .infocard-content {
    padding: 10px 14px;
    overflow-y: auto;
    flex: 1;
  }
  .infocard-content a {
    color: #4fc3f7;
    text-decoration: none;
  }
  .infocard-content a:hover {
    text-decoration: underline;
  }
  .infocard-content h1, .infocard-content h2, .infocard-content h3 {
    color: #e0e8f0;
    margin: 0 0 6px;
  }
  .infocard-content h3 { font-size: 14px; }
  .infocard-content p { margin: 0 0 8px; }
  .infocard-content img { max-width: 100%; border-radius: 4px; }
  .infocard-content code {
    background: rgba(79, 195, 247, 0.08);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12px;
  }
`;

// ============================================================
// INFOCARD
// ============================================================

const EDGE_MARGIN = 10;

class InfoCard {

  static styles = INFOCARD_STYLES;
  static _instance = null;

  /**
   * Initialise the InfoCard singleton.
   * @param {Object} opts
   * @param {string|Element|null} opts.anchor   — CSS selector or element whose centre defines the horizontal anchor. Null = viewport centre.
   * @param {Function} opts.content             — (element, x, y) => htmlString.  '' = hide.
   * @param {number} [opts.width=320]
   * @param {number} [opts.height=400]
   * @param {number} [opts.sideSwapDelay=300]
   * @param {number} [opts.contentUpdateDelay=300]
   * @param {number} [opts.hideDelay=300]
   * @param {number} [opts.showDelay=300]
   * @param {number} [opts.callbackThrottle=100]
   */
  static init(opts) {
    if (InfoCard._instance) InfoCard._instance._teardown();
    InfoCard._instance = new InfoCard(opts);
    return InfoCard._instance;
  }

  static destroy() {
    if (InfoCard._instance) {
      InfoCard._instance._teardown();
      InfoCard._instance = null;
    }
  }

  static getInstance() { return InfoCard._instance; }

  // ── Instance ───────────────────────────────────────────────

  constructor(opts) {
    this.options = {
      anchor: null,
      content: () => '',
      width: 320,
      height: 400,
      sideSwapDelay: 100,
      contentUpdateDelay: 100,
      hideDelay: 300,
      showDelay: 100,
      callbackThrottle: 100,
      ...opts,
    };

    // State
    this._visible = false;
    this._pinned = false;
    this._overCard = false;
    this._dragging = false;
    this._currentSide = null;       // 'left' | 'right'
    this._currentContent = '';
    this._lastCallbackResult = null; // track to avoid redundant updates
    this._manualPosition = null;     // {x,y} when dragged
    this._dragStart = null;          // {mx, my, cx, cy}

    // Cached geometry
    this._candidates = { left: 0, right: 0 };
    this._anchorX = 0;

    // Timers
    this._timers = {
      sideSwap: null,
      content: null,
      hide: null,
      show: null,
      throttle: null,
      settled: null,
    };

    this._lastMoveEvent = null;

    // Bound handlers (for removal)
    this._bound = {
      onMouseMove: this._onMouseMove.bind(this),
      onMouseEnterCard: this._onMouseEnterCard.bind(this),
      onMouseLeaveCard: this._onMouseLeaveCard.bind(this),
      onHeaderDown: this._onHeaderDown.bind(this),
      onDragMove: this._onDragMove.bind(this),
      onDragEnd: this._onDragEnd.bind(this),
      onPinClick: this._onPinClick.bind(this),
      onResize: this._onCardResize.bind(this),
    };

    this._init();
  }

  // ── Setup & teardown ───────────────────────────────────────

  _init() {
    // Inject styles
    if (!document.getElementById('infocard-styles')) {
      const s = document.createElement('style');
      s.id = 'infocard-styles';
      s.textContent = this.options.styles ?? INFOCARD_STYLES;
      document.head.appendChild(s);
    }

    // Build card DOM
    this._card = document.createElement('div');
    this._card.className = 'infocard';
    this._card.style.width = this.options.width + 'px';
    this._card.style.height = this.options.height + 'px';

    // Header
    this._header = document.createElement('div');
    this._header.className = 'infocard-header';

    const dragHint = document.createElement('span');
    dragHint.className = 'infocard-drag-hint';
    dragHint.textContent = '⠿';

    this._pinBtn = document.createElement('button');
    this._pinBtn.className = 'infocard-pin';
    this._pinBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 2l-4 4-4.5 1L4 10.5 8.5 15 3 21h2l5-5.5L14.5 20 18 16.5l1-4.5 4-4-7-6zm-.5 2.5L19 8l-3 3-.7 3.5L12 17.8 6.2 12l3.3-3.3L13 8l3-3z"/></svg>';
    this._pinBtn.title = 'Pin card';

    this._header.appendChild(dragHint);
    this._header.appendChild(this._pinBtn);

    // Content area
    this._contentEl = document.createElement('div');
    this._contentEl.className = 'infocard-content';

    this._card.appendChild(this._header);
    this._card.appendChild(this._contentEl);
    document.body.appendChild(this._card);

    // Compute anchor & candidates
    this._updateAnchor();
    this._computeCandidates();

    // Listeners
    document.addEventListener('mousemove', this._bound.onMouseMove);
    this._card.addEventListener('mouseenter', this._bound.onMouseEnterCard);
    this._card.addEventListener('mouseleave', this._bound.onMouseLeaveCard);
    this._header.addEventListener('mousedown', this._bound.onHeaderDown);
    this._pinBtn.addEventListener('click', this._bound.onPinClick);

    // Watch for card resize (user-driven via CSS resize handle)
    this._resizeObserver = new ResizeObserver(this._bound.onResize);
    this._resizeObserver.observe(this._card);

    // Recompute on window resize
    this._bound.onWindowResize = () => {
      this._updateAnchor();
      this._computeCandidates();
      if (this._visible && !this._manualPosition) {
        this._applyPosition(this._lastMoveEvent);
      }
    };
    window.addEventListener('resize', this._bound.onWindowResize);
  }

  _teardown() {
    document.removeEventListener('mousemove', this._bound.onMouseMove);
    document.removeEventListener('mousemove', this._bound.onDragMove);
    document.removeEventListener('mouseup', this._bound.onDragEnd);
    window.removeEventListener('resize', this._bound.onWindowResize);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    for (const k in this._timers) clearTimeout(this._timers[k]);
    if (this._card && this._card.parentNode) this._card.parentNode.removeChild(this._card);
  }

  // ── Anchor & candidates ────────────────────────────────────

  _updateAnchor() {
    const a = this.options.anchor;
    if (a) {
      const el = typeof a === 'string' ? document.querySelector(a) : a;
      if (el) {
        const r = el.getBoundingClientRect();
        this._anchorX = r.left + r.width / 2;
        return;
      }
    }
    this._anchorX = window.innerWidth / 2;
  }

  _computeCandidates() {
    const vw = window.innerWidth;
    const cardW = this._card.offsetWidth;
    const maxDist = 1.1 * Math.max(200, cardW);

    // Right candidate: push card right, near edge ≤ maxDist from anchor
    const rightX = Math.min(vw - cardW - EDGE_MARGIN, this._anchorX + maxDist);

    // Left candidate: push card left, near (right) edge ≤ maxDist from anchor
    const leftX = Math.max(EDGE_MARGIN, this._anchorX - maxDist - cardW);

    this._candidates = {
      right: Math.max(EDGE_MARGIN, rightX),
      left: Math.max(EDGE_MARGIN, Math.min(leftX, vw - cardW - EDGE_MARGIN)),
    };
  }

  // ── Mouse move (main loop) ─────────────────────────────────

  _onMouseMove(e) {
    this._lastMoveEvent = e;

    // Vertical tracking: always immediate (unless pinned or dragging or hovering card)
    if (!this._pinned && !this._dragging && !this._overCard && this._visible) {
      this._applyVertical(e.clientY);
    }

    // Side selection: always compute, but swap is delayed
    if (!this._pinned && !this._dragging && !this._manualPosition && !this._overCard) {
      this._evaluateSide(e.clientX);
    }

    // Skip callback when cursor is over the card
    if (this._overCard || this._dragging) return;

    // Throttled content callback
    this._scheduleCallback(e);
  }

  // ── Vertical position (optical stability) ──────────────────

  _applyVertical(cursorY) {
    const vh = window.innerHeight;
    const cardH = this._card.offsetHeight;
    const range = vh - cardH - 2 * EDGE_MARGIN;

    if (range <= 0) {
      // Card taller than viewport — pin to top
      this._card.style.top = EDGE_MARGIN + 'px';
    } else {
      const t = cursorY / vh; // 0…1
      this._card.style.top = (EDGE_MARGIN + t * range) + 'px';
    }
  }

  // ── Horizontal side selection ──────────────────────────────

  _evaluateSide(cursorX) {
    // Distance from cursor to each candidate card position
    const cardW = this._card.offsetWidth;

    const distRight = this._candidates.right - cursorX;       // positive = card is to the right
    const distLeft  = cursorX - (this._candidates.left + cardW); // positive = card is to the left

    const bestSide = distRight >= distLeft ? 'right' : 'left';

    if (bestSide !== this._currentSide) {
      clearTimeout(this._timers.sideSwap);
      this._timers.sideSwap = setTimeout(() => {
        // Re-check state: don't swap if pinned, dragging, over card, or manually positioned
        if (this._pinned || this._dragging || this._overCard || this._manualPosition) return;
        this._currentSide = bestSide;
        this._card.style.left = this._candidates[bestSide] + 'px';
      }, this._currentSide === null ? 0 : this.options.sideSwapDelay);
    }
  }

  // ── Full position apply (used on show and resize) ──────────

  _applyPosition(e) {
    if (!e) return;
    if (this._manualPosition) {
      this._card.style.left = this._manualPosition.x + 'px';
      this._card.style.top  = this._manualPosition.y + 'px';
      return;
    }
    this._applyVertical(e.clientY);
    // Force immediate side pick
    const cardW = this._card.offsetWidth;
    const distRight = this._candidates.right - e.clientX;
    const distLeft  = e.clientX - (this._candidates.left + cardW);
    this._currentSide = distRight >= distLeft ? 'right' : 'left';
    this._card.style.left = this._candidates[this._currentSide] + 'px';
  }

  // ── Throttled content callback ─────────────────────────────

  _scheduleCallback(e) {
    this._lastMoveEvent = e;
    clearTimeout(this._timers.settled);

    if (!this._timers.throttle) {
      this._fireCallback(e);
      this._timers.throttle = setTimeout(() => {
        this._timers.throttle = null;
      }, this.options.callbackThrottle);
    }

    // Trailing edge — always fire the settled position
    this._timers.settled = setTimeout(() => {
      this._fireCallback(this._lastMoveEvent);
    }, this.options.callbackThrottle);
  }

  _fireCallback(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    // Ignore if over the card itself
    if (el && this._card.contains(el)) return;

    let html;
    try {
      html = this.options.content(el, e.clientX, e.clientY);
    } catch (err) {
      console.warn('InfoCard content callback error:', err);
      html = '';
    }
    if (html == null) html = '';

    // Only act if the result changed
    if (html === this._lastCallbackResult) return;
    this._lastCallbackResult = html;

    clearTimeout(this._timers.content);
    clearTimeout(this._timers.show);
    clearTimeout(this._timers.hide);

    if (html) {
      // Schedule content update (and show if needed)
      this._timers.content = setTimeout(() => {
        // Re-check: don't update if state changed (dragging, over card, pinned)
        if (this._dragging || this._overCard) return;
        this._setContent(html);
        if (!this._visible) {
          this._applyPosition(this._lastMoveEvent);
          this._show();
        }
      }, this._visible ? this.options.contentUpdateDelay : this.options.showDelay);
    } else {
      // Schedule hide
      this._timers.hide = setTimeout(() => {
        this._hide();
      }, this.options.hideDelay);
    }
  }

  // ── Content DOM update ─────────────────────────────────────

  _setContent(html) {
    if (html === this._currentContent) return;
    this._currentContent = html;
    this._contentEl.innerHTML = html;
  }

  // ── Show / Hide ────────────────────────────────────────────

  _show() {
    if (this._visible) return;
    this._visible = true;
    this._card.classList.add('visible');
  }

  _hide() {
    if (!this._visible || this._pinned || this._dragging) return;
    this._visible = false;
    this._card.classList.remove('visible');
    this._currentSide = null;
    this._lastCallbackResult = null;
    this._manualPosition = null;
    this._card.classList.remove('pinned');
    this._pinBtn.classList.remove('pinned');
    this._pinned = false;
  }

  // ── Card hover (freeze & keep visible) ─────────────────────

  _onMouseEnterCard() {
    this._overCard = true;
    clearTimeout(this._timers.hide);
    clearTimeout(this._timers.content);
    clearTimeout(this._timers.sideSwap);
  }

  _onMouseLeaveCard() {
    this._overCard = false;
    // If not pinned, resume normal behaviour —
    // the next mousemove will fire the callback.
    // If the cursor lands on empty space, callback returns ''
    // and hide will be scheduled.
  }

  // ── Drag ───────────────────────────────────────────────────

  _onHeaderDown(e) {
    if (e.target === this._pinBtn || this._pinBtn.contains(e.target)) return;
    e.preventDefault();
    this._dragging = true;
    // Kill all pending timers — nothing should fire during a drag
    clearTimeout(this._timers.sideSwap);
    clearTimeout(this._timers.content);
    clearTimeout(this._timers.hide);
    clearTimeout(this._timers.show);
    clearTimeout(this._timers.settled);
    const rect = this._card.getBoundingClientRect();
    this._dragStart = {
      mx: e.clientX,
      my: e.clientY,
      cx: rect.left,
      cy: rect.top,
    };
    document.addEventListener('mousemove', this._bound.onDragMove);
    document.addEventListener('mouseup', this._bound.onDragEnd);
  }

  _onDragMove(e) {
    if (!this._dragging) return;
    const dx = e.clientX - this._dragStart.mx;
    const dy = e.clientY - this._dragStart.my;
    const x = this._dragStart.cx + dx;
    const y = this._dragStart.cy + dy;
    this._card.style.left = x + 'px';
    this._card.style.top  = y + 'px';
    this._manualPosition = { x, y };
  }

  _onDragEnd() {
    this._dragging = false;
    document.removeEventListener('mousemove', this._bound.onDragMove);
    document.removeEventListener('mouseup', this._bound.onDragEnd);
    // Auto-pin on drag
    if (!this._pinned) {
      this._pinned = true;
      this._card.classList.add('pinned');
      this._pinBtn.classList.add('pinned');
    }
  }

  // ── Pin / Unpin ────────────────────────────────────────────

  _onPinClick(e) {
    e.stopPropagation();
    this._pinned = !this._pinned;
    this._card.classList.toggle('pinned', this._pinned);
    this._pinBtn.classList.toggle('pinned', this._pinned);
    this._pinBtn.title = this._pinned ? 'Unpin card' : 'Pin card';

    if (this._pinned) {
      // Lock current position and cancel any pending movements
      clearTimeout(this._timers.sideSwap);
      clearTimeout(this._timers.content);
      const rect = this._card.getBoundingClientRect();
      this._manualPosition = { x: rect.left, y: rect.top };
    } else {
      // Return to tracking mode
      this._manualPosition = null;
      if (this._lastMoveEvent) {
        this._computeCandidates();
        this._applyPosition(this._lastMoveEvent);
      }
    }
  }

  // ── Resize observer ────────────────────────────────────────

  _onCardResize() {
    this._computeCandidates();
    if (this._dragging) return;
    // If the user is interacting with the card (resizing via handle), auto-pin
    if (this._overCard && !this._pinned) {
      this._pinned = true;
      this._card.classList.add('pinned');
      this._pinBtn.classList.add('pinned');
      const rect = this._card.getBoundingClientRect();
      this._manualPosition = { x: rect.left, y: rect.top };
      return;
    }
    // If not manually positioned, re-apply computed position
    if (!this._manualPosition && this._lastMoveEvent && this._visible) {
      this._card.style.left = this._candidates[this._currentSide] + 'px';
      this._applyVertical(this._lastMoveEvent.clientY);
    }
  }
}

// ============================================================
// Expose globally
// ============================================================

if (typeof window !== 'undefined') {
  window.InfoCard = InfoCard;
}

export { InfoCard }
