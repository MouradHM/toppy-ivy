import { TemplateRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Content, ContentData, ContentProps, ContentType, ToppyEvent, ToppyEventName } from './models';

export function getContent(data: ContentData, props: ContentProps = {}): Content {
  let type: ContentType = ContentType.COMPONENT;

  if (typeof data === 'string' && props['hasHTML']) type = ContentType.HTML;
  else if (typeof data === 'string') type = ContentType.STRING;
  else if (data instanceof TemplateRef) type = ContentType.TEMPLATE;

  return { data, type, props };
}

export function createId() {
  return Math.random()
    .toString(36)
    .substring(2, 5);
}

/* html dom utils */

export function cssClass(method: 'add' | 'remove', cls: string[], target: string = 'body') {
  document.querySelector(target).classList[method](...cls);
}

export function toCss(styleObj) {
  return Object.keys(styleObj)
    .map(x => `${x}:${styleObj[x]}${typeof styleObj[x] === 'number' ? 'px' : ''}`)
    .join(';');
}

export function percentToCss(max, percentage: string): string {
  let number = Number(percentage.slice(0, -1));
  if (number > 100) {
    number = 100;
  }
  return `calc(${max}px - ${100 - number}%)`;
}

export function setWH(src, host, key, value) {
  if (typeof value === 'number') {
    host[key] = value = Math.abs(value);
  }

  if (typeof value === 'string' && value.endsWith('%')) {
    value = percentToCss(src[key], value);
  }

  return value;
}

export const BodyEl = document.querySelector('body');

/* events */

class BusClass {
  private _e: Subject<ToppyEvent> = new Subject();
  send(from: string, name: ToppyEventName, data: any = null): void {
    this._e.next({ from, name, data });
  }
  listen(from: string, name: ToppyEventName): Observable<any> {
    return this._e.asObservable().pipe(
      filter(e => e.from === from && e.name === name),
      map(e => e.data)
    );
  }

  stop(): void {
    this._e.complete();
  }
}
export const Bus = new BusClass();
