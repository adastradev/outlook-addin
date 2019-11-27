const _defaultSettings = {
  showWelcomeScreen: 2, // 1 = never, 2 = next time, 3 = always
  useSampleData: false,
  // apiBasePath: 'https://ache-bridge-api-alpha.herokuapp.com', // Bo's Heroku Alpha (pointing to client data)
  apiBasePath: 'https://ache-bridge-api.herokuapp.com', // Bo's Heroku (pointing to client data)
  // apiBasePath: 'https://lit-shelf-67655.herokuapp.com', // Ryan's Heroku (pointing to test data)
}

export const WELCOME_SCREEN_SETTTING = 'adastra.demo.showWelcomeScreen';
export const SELECTED_ROOM_SETTING = 'adastra.demo.selectedRoom';

export function getDefaultSettings() {
  return _defaultSettings;
};
