export const isOsx = process.platform === "darwin";
export const isWindows = process.platform === "win32";
export const isLinux = process.platform === "linux";
export const isDevelopment = process.env.NODE_ENV !== "production";

export const editorWinOptions = {
  minWidth: 550,
  minHeight: 350,
  width: 1080,
  height: 720,
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false
  },
  useContentSize: true,
  show: true, // Show the window after the app is ready.
  frame: false,
  titleBarStyle: "hiddenInset",
  zoomFactor: 1.0
};

export const preferencesWinOptions = {
  width: 950,
  height: 650,
  webPreferences: {
    nodeIntegration: true,
    webSecurity: false
  },
  fullscreenable: false,
  fullscreen: false,
  resizable: false,
  minimizable: false,
  maximizable: false,
  useContentSize: true,
  show: true,
  frame: false,
  thickFrame: !isOsx,
  titleBarStyle: "hiddenInset",
  zoomFactor: 1.0
};

export const PANDOC_EXTENSIONS = [
  "html",
  "docx",
  "odt",
  "latex",
  "tex",
  "ltx",
  "rst",
  "rest",
  "org",
  "wiki",
  "dokuwiki",
  "textile",
  "opml",
  "epub"
];

export const BLACK_LIST = ["$RECYCLE.BIN"];

export const TITLE_BAR_HEIGHT = isOsx ? 21 : 32;
export const LINE_ENDING_REG = /(?:\r\n|\n)/g;
export const LF_LINE_ENDING_REG = /(?:[^\r]\n)|(?:^\n$)/;
export const CRLF_LINE_ENDING_REG = /\r\n/;

export const URL_REG = /^http(s)?:\/\/([a-z0-9\-._~]+\.[a-z]{2,}|[0-9.]+|localhost|\[[a-f0-9.:]+\])(:[0-9]{1,5})?(\/[\S]+)?/i;
