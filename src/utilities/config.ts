const _defaultSettings = {
  showWelcomeScreen: 2, // 1 = never, 2 = next time, 3 = always
  useSampleData: false,
  apiBasePath: 'https://bcxb69ay5h.execute-api.us-east-1.amazonaws.com/v0-prod',
}

export const WELCOME_SCREEN_SETTTING = 'adastra.demo.showWelcomeScreen';
export const SELECTED_ROOM_SETTING = 'adastra.demo.selectedRoom';

export function getDefaultSettings() {
  return _defaultSettings;
};
