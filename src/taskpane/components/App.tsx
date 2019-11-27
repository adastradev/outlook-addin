import * as React from 'react';
import { PrimaryButton, ButtonType } from 'office-ui-fabric-react';
import Header from './Header';
import HeroList, { HeroListItem } from './HeroList';
import ConfirmationScreen from './ConfirmationScreen';
import RoomFinder from './RoomFinder';
import { WELCOME_SCREEN_SETTTING, getDefaultSettings } from '../../utilities/config';

export interface AppProps {
  isOfficeInitialized: boolean;
}

export interface AppState {
  listItems: HeroListItem[];
  bookedRoomDetails: HeroListItem[];
  scheduleEventUrl: string;
  officeSettingsInitializationState: number; // quick hack - 0: unstarted 1: inprogress 2: done
  showIntro: boolean;
  showConfirmationScreen: boolean;
  useSampleData: boolean;
  apiBasePath: string;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: [],
      bookedRoomDetails: [],
      scheduleEventUrl: '',
      officeSettingsInitializationState: 0,
      // can't set these accurately until isOfficeInitialized is true
      showIntro: true,
      showConfirmationScreen: false,
      useSampleData: false,
      apiBasePath: '',
    };
  }

  _initializeOfficeSettings() {

    const defaults = getDefaultSettings();

    let showWelcome = Office.context.roamingSettings.get(WELCOME_SCREEN_SETTTING);
    let useDemoData; // no longer loading this from settings - it's problematic for updating customer's add-in seamlessly
    let apiPath; // no longer loading this from settings - it's problematic for updating customer's add-in seamlessly
    let showIntro = true;

    if (showWelcome === undefined) {
      showWelcome = defaults.showWelcomeScreen;
      console.log(`Welcome screen setting not set, initializing to ${showWelcome}`);
    }

    if (useDemoData === undefined) {
      useDemoData = defaults.useSampleData;
      console.log(`Sample data setting not set, initializing to ${useDemoData}`);
    }

    if (apiPath === undefined) {
      apiPath = defaults.apiBasePath;
      console.log(`API base path setting not set, initializing to ${apiPath}`);
    }

    if (showWelcome === 1) {
      showIntro = false;
    } else if (showWelcome === 2) {
      showIntro = true;
      showWelcome = 1;
    } else {
      showIntro = true;
    }

    var that = this;
    Office.context.roamingSettings.set(WELCOME_SCREEN_SETTTING, showWelcome);

    this.setState({
      showIntro: showIntro,
      useSampleData: useDemoData,
      apiBasePath: apiPath,
    }, () => {
      // some changes may have occured, so sync the settings
      Office.context.roamingSettings.saveAsync(() => {
        that.setState({officeSettingsInitializationState: 2});
      });
    });
  }

  componentDidMount() {
    this.setState({
      listItems: [
        {
          icon: 'Search',
          primaryText: 'Find available rooms in Ad Astra'
        },
        {
          icon: 'DateTime',
          primaryText: 'Reserve room(s) in Ad Astra'
        }
      ]
    });
  }

  componentDidUpdate() {
    if (this.props.isOfficeInitialized && this.state.officeSettingsInitializationState === 0) {
      this.setState({officeSettingsInitializationState: 1});
      this._initializeOfficeSettings();
    }
  }

  click = async () => {
    this.setState({ showIntro: false });
  }

  renderIntro() {
    return (
      <div className='ms-welcome'>
        <Header logo='assets/logo-filled.png' title='' message='Welcome' />
        <HeroList message='Discover what Ad Astra for Outlook can do for you!' items={this.state.listItems}>
          <PrimaryButton className='ms-welcome__action' buttonType={ButtonType.hero} onClick={this.click} text="Get Started"/>
        </HeroList>
      </div>
    );
  }

  renderConfirmationScreen() {
    return (
      <div className='ms-welcome'>
        <Header logo='assets/logo-filled.png' title='' message='Success!' />
        <ConfirmationScreen
          message='You booked the following room in Astra Schedule'
          items={this.state.bookedRoomDetails}
          />
        <main className='ms-welcome__main'>
          <ul className="msms-List ms-welcome__features ms-u-slideUpIn10">
            <li className='ms-ListItem'>
              <i className="ms-Icon ms-Icon--ForwardEvent"></i>&nbsp;<a className="ms-font-m ms-fontColor-neutralPrimary" href={this.state.scheduleEventUrl}>Open Event in Astra Schedule</a>
            </li>
          </ul>
        </main>
      </div>
    );
  }

  onBookRoomSuccessful = (roomName, eventDay, eventStart, eventEnd, scheduleEventUrl) => {
    this.setState({
      showConfirmationScreen: true,
      bookedRoomDetails: [
        {
          icon: 'Room',
          primaryText: `${roomName}`
        },
        {
          icon: 'EventDate',
          primaryText: `${eventDay}`
        },
        {
          icon: 'Clock',
          primaryText: `${eventStart} to ${eventEnd}`
        },
      ],
      scheduleEventUrl: scheduleEventUrl
    });
  }

  render() {

    const {
      isOfficeInitialized,
    } = this.props;

    if (!isOfficeInitialized || this.state.officeSettingsInitializationState < 2) {
      return (
        <div></div>
      );
    }

    if (this.state.showIntro) {
      return this.renderIntro();
    } else if (this.state.showConfirmationScreen) {
      return this.renderConfirmationScreen();
    } else {
      return (
        <RoomFinder
          useSampleData={this.state.useSampleData}
          apiBasePath={this.state.apiBasePath}
          onBookRoomSuccessful={this.onBookRoomSuccessful}
        >
        </RoomFinder>
      );
    }
  }
}
