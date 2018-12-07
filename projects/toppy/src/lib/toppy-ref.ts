import { animationFrameScheduler, fromEvent, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, observeOn, skipWhile, takeUntil, tap } from 'rxjs/operators';
import { HostContainer } from './host-container';
import { ToppyConfig } from './models';
import { OverlayInstance } from './overlay-instance';
import { getContentMeta, _on, _fire } from './utils';

export class ToppyRef {
  updateTextContent: Subject<string> = new Subject();
  private _isOpen = false;
  private _alive: Subject<Boolean> = new Subject();
  private _listenDocumentEvents = true;

  constructor(
    private _overlay: OverlayInstance,
    private _host: HostContainer,
    private _config: ToppyConfig,
    public overlayID: string
  ) {
    this.updateTextContent.subscribe(content => {
      if (this._isOpen) {
        this._overlay.updateTextContent(content);
      }
    });
  }

  open() {
    if (this._isOpen) {
      return;
    }
    const view = this._host.attach();
    this._overlay.create().setView(view);
    if (this._listenDocumentEvents) {
      this.onDocumentClick().subscribe();
      this.onWindowResize().subscribe();
      this.onEscClick().subscribe();
    }
    setTimeout(_ => this._overlay.computePosition.next(true), 1);
    _fire({ name: 'OPENED_OVERLAY_INS', data: this.overlayID });
    this._isOpen = true;
    return this;
  }

  close() {
    this._host.detach();
    _fire({ name: 'REMOVED_OVERLAY_INS', data: this.overlayID });
    this._overlay.destroy();
    this._cleanup();
    this._isOpen = false;
  }

  toggle() {
    return this._isOpen ? this.close() : this.open();
  }

  events() {
    return _on();
  }

  onEscClick() {
    return fromEvent(document.getElementsByTagName('body'), 'keydown').pipe(
      takeUntil(this._alive),
      skipWhile(() => !this._config.closeOnEsc),
      filter((e: any) => (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) && e.target.nodeName === 'BODY'),
      tap(e => e.preventDefault()),
      map((e: any) => e.target),
      tap(() => this.close())
    );
  }

  onDocumentClick(): Observable<any> {
    return fromEvent(this._overlay.getContainerEl(), 'click').pipe(
      takeUntil(this._alive),
      map((e: any) => e.target),
      skipWhile(() => !this._config.dismissOnDocumentClick),
      filter(this._overlay.isHostElement.bind(this._overlay)),
      tap(_ => this._config.docClickCallback.call(null)),
      tap(() => this.close())
    );
  }

  onWindowResize(): Observable<any> {
    const onResize = fromEvent(window, 'resize');
    const onScroll = fromEvent(window, 'scroll', { passive: true });
    return merge(onResize, onScroll).pipe(
      takeUntil(this._alive),
      debounceTime(5),
      observeOn(animationFrameScheduler),
      distinctUntilChanged(),
      tap(() => {
        this._overlay.computePosition.next(true);
        this._overlay.config.windowResizeCallback();
      })
    );
  }

  getConfig() {
    return this._config;
  }

  updateHost(content, props = {}) {
    const data = getContentMeta(content, props, this.overlayID);
    this._host.configure(data);
    return this;
  }

  updatePosition(positionConfig) {
    this._overlay.updatePositionConfig(positionConfig);
    return this;
  }

  private _cleanup() {
    this._alive.next(true);
  }
}
