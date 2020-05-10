/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { render, h } from 'preact';
import { Overlay, ErrorSource } from './ui';

const isPromiseLike = <T extends unknown>(x: unknown): x is PromiseLike<T> =>
  typeof x === 'object' && !!x && typeof (x as PromiseLike<T>).then === 'function';

export interface IErrorOverlayManager {
  /**
   * Installs the error in the given container
   */
  install(container: HTMLElement | null): void;

  /**
   * Wraps the function, catching and displaying rejected errors in the
   * container element. Resolves as undefined if an error occurred.
   */
  wrap<T>(container: HTMLElement | null, fn: () => PromiseLike<T>): Promise<T | undefined>;

  /**
   * Wraps the function, catching and displaying thrown errors in the
   * container element. Returns undefined if an error occurred.
   */
  wrap<T>(container: HTMLElement | null, fn: () => T): T | undefined;

  /**
   * Removes the error overlay listener.
   */
  uninstall(): void;
}

/**
 * Implementation of the error overlay manager.
 */
export class ErrorOverlayManager implements IErrorOverlayManager {
  private containers: ReadonlyArray<HTMLElement> = [];
  private unmountOverlay = new Map<HTMLElement, (allowRetry: boolean) => void>();
  private isInstalledGlobally = false;

  private readonly listener = (rawEvent: MessageEvent) => {
    if (rawEvent.data.type === 'webpackErrors') {
      for (const container of this.containers) {
        this.displayErrorIn(container, rawEvent.data.data, ErrorSource.Compilation);
      }
    }
  };

  /**
   * @inheritdoc
   */
  public install(container: HTMLElement) {
    if (!this.isInstalledGlobally) {
      this.isInstalledGlobally = true;
      window.addEventListener('message', this.listener);
    }

    const containers = this.containers.filter((c) => document.body.contains(c));
    containers.push(container);
    this.containers = containers;
  }

  /**
   * @inheritdoc
   */
  public wrap<T>(container: HTMLElement | null, fn: () => PromiseLike<T>): Promise<T | undefined>;

  /**
   * @inheritdoc
   */
  public wrap<T>(container: HTMLElement | null, fn: () => T): T | undefined;

  public wrap<T>(
    container: HTMLElement | null,
    fn: () => Promise<T> | T,
  ): T | undefined | Promise<T | undefined> {
    if (!container) {
      return;
    }

    this.hideErrorIn(container, false);
    this.install(container);
    const retry = () => this.wrap(container, fn);

    try {
      const ret = fn();
      if (ret && isPromiseLike<T>(ret)) {
        return ret.then(
          (v) => v,
          (err) => {
            this.displayErrorIn(container, [err], ErrorSource.Runtime, retry);
            return undefined;
          },
        );
      }
    } catch (err) {
      this.displayErrorIn(container, [err], ErrorSource.Runtime, retry);
    }

    return undefined;
  }

  /**
   * @inheritdoc
   */
  public uninstall() {
    for (const unmount of this.unmountOverlay.values()) {
      unmount(false);
    }

    this.unmountOverlay.clear();
    window.removeEventListener('message', this.listener);
  }

  private displayErrorIn(
    container: HTMLElement | null,
    errors: ReadonlyArray<Error | string>,
    source: ErrorSource,
    retry?: () => void,
  ) {
    if (!container) {
      return;
    }

    this.hideErrorIn(container, false); // make sure we don't ovewrite and get confused

    const errorStrs = errors.map((e) =>
      typeof e === 'string' ? e : e.stack || e.message || String(e),
    );

    const elem = (
      <Overlay source={source} close={() => this.hideErrorIn(container, true)} errors={errorStrs} />
    );

    render(elem, container);
    this.unmountOverlay.set(container, (allowRetry) => {
      const overlay = container.querySelector('.notebook-error-overlay');
      if (overlay) {
        container.removeChild(overlay);
      }

      if (allowRetry && retry) {
        retry();
      }
    });
  }

  private hideErrorIn(container: HTMLElement, allowRetry: boolean) {
    const unmountFn = this.unmountOverlay.get(container);
    if (unmountFn) {
      unmountFn(allowRetry);
      this.unmountOverlay.delete(container);
    }
  }
}
