/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { IErrorOverlayManager, ErrorOverlayManager } from './overlay';

let manager: IErrorOverlayManager;

// This conditional will be checked by webpack so the error overlay isn't
// included in the production build:
if (process.env.NODE_ENV === 'development') {
  manager = new ErrorOverlayManager();
} else {
  manager = {
    install: () => undefined,
    wrap: <T>(_: HTMLElement, t: () => T) => t(),
    uninstall: () => undefined,
  };
}

export default manager;
