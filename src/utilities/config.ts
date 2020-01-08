// These values will be inlined using the DefinePlugin in webpack, but TS needs the declaration
declare var __API_BASE_PATH__: string;
declare var __SCHEDULE_BASE_PATH__: string;
declare var __ADDIN_ID__: string;

const _defaultSettings = {
  showWelcomeScreen: 2, // 1 = never, 2 = next time, 3 = always
  useSampleData: false,
  apiBasePath: __API_BASE_PATH__,
  astraScheduleBasePath: __SCHEDULE_BASE_PATH__,
  addinId: __ADDIN_ID__
}

export const WELCOME_SCREEN_SETTTING = 'adastra.demo.showWelcomeScreen';
export const SELECTED_ROOM_SETTING = 'adastra.demo.selectedRoom';

export function getDefaultSettings() {
  return _defaultSettings;
};
