/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import { h, FunctionComponent } from 'preact';
import { parseColors, Color } from 'vscode-webview-tools';

const colors = parseColors();

export const enum ErrorSource {
  Runtime,
  Compilation,
}

export const Overlay: FunctionComponent<{
  close(): void;
  source: ErrorSource;
  errors: ReadonlyArray<string>;
}> = ({ errors, source, close }) => (
  <div className="notebook-error-overlay" style={{ minHeight: 500 }}>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        fontFamily: colors[Color.FontFamily],
        fontSize: colors[Color.FontSize],
        fontWeight: colors[Color.FontWeight],
        background: colors[Color.InputValidationErrorBackground],
        border: `1px solid ${colors[Color.InputValidationErrorBorder]}`,
        color: colors[Color.InputValidationErrorForeground],
        padding: 5,
      }}
    >
      <h1 style={{ fontSize: '1.5em', margin: '0 0 0.25em', fontWeight: 'normal' }}>
        Errors occurred when {source === ErrorSource.Compilation ? 'compiling' : 'rendering'}:
      </h1>
      {errors.map((err, i) => (
        <ErrorMessage error={err} key={i} />
      ))}
    </div>
    <CloseButton onClick={close} source={source} />
  </div>
);

const CloseButton: FunctionComponent<{ onClick(): void; source: ErrorSource }> = ({
  source,
  onClick,
}) => (
  <button
    onClick={onClick}
    title={source === ErrorSource.Compilation ? 'Dismiss' : 'Retry'}
    style={{
      position: 'absolute',
      top: 3,
      right: 3,
      border: 0,
      background: 'none',
      padding: 0,
      margin: 0,
      outline: 0,
      cursor: 'pointer',
    }}
  >
    {source === ErrorSource.Compilation ? (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.00001 8.70711L11.6465 12.3536L12.3536 11.6465L8.70711 8.00001L12.3536 4.35356L11.6465 3.64645L8.00001 7.2929L4.35356 3.64645L3.64645 4.35356L7.2929 8.00001L3.64645 11.6465L4.35356 12.3536L8.00001 8.70711Z"
          fill="#C5C5C5"
        />
      </svg>
    ) : (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.00583 8.26691L0.78 9.50003L0 8.73003L2.09 6.66003L2.85 6.67003L4.94 8.79003L4.18 9.55003L3.01348 8.36995C3.20279 10.9587 5.363 13 8 13C9.91063 13 11.571 11.9283 12.4127 10.3533L13.226 10.95C12.1959 12.771 10.2415 14 8 14C4.77573 14 2.14547 11.4568 2.00583 8.26691ZM12.9961 7.80051L11.76 6.55005L11 7.31005L13.09 9.42005L13.85 9.43005L15.94 7.36005L15.19 6.60005L13.996 7.78004C13.8803 4.56822 11.2401 2 8 2C5.83726 2 3.94178 3.14429 2.88597 4.86047L3.69562 5.45435C4.56645 3.98499 6.16818 3 8 3C10.6946 3 12.8914 5.13152 12.9961 7.80051Z"
          fill="#C5C5C5"
        />
      </svg>
    )}
  </button>
);

const ErrorMessage: FunctionComponent<{ error: string }> = ({ error }) => (
  <pre
    style={{
      fontFamily: colors[Color.EditorFontFamily],
      fontSize: colors[Color.EditorFontSize],
      fontWeight: colors[Color.EditorFontWeight],
      width: '100%',
      overflowX: 'auto',
      lineHeight: '1.5em',
    }}
  >
    {error.split('\n').map((line, i) => (
      <code
        key={i}
        style={{
          padding: '0.1em 0.3em',
          background: i % 2 ? 'rgba(0, 0, 0, 0.2)' : 'none',
          display: 'table-row',
          whitespace: 'no-wrap',
        }}
      >
        {line}
      </code>
    ))}
  </pre>
);
