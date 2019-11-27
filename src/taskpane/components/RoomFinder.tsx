import * as React from 'react';
import RoomList from './RoomList';
import axios from 'axios';
import {
  Spinner,
  SpinnerSize,
  PrimaryButton,
  ButtonType,
  Stack,
  IStackStyles,
  // SearchBox,
  Toggle,
  MessageBar,
  MessageBarType 
} from 'office-ui-fabric-react';
import moment from 'moment';
import { createListItems } from '../../utilities/exampleData';
import SettingsDialog from './SettingsDialog';
import { SELECTED_ROOM_SETTING } from '../../utilities/config';

const stackStyles: IStackStyles = {
  root: {
    height: 250
  }
};

export interface IRoomFinderProps {
  useSampleData: boolean;
  apiBasePath: string;
  onBookRoomSuccessful: Function;
}

export interface IRoomFinderState {
  isLoading: boolean;
  isBooking: boolean;
  hasError: boolean;
  startTime: any;
  endTime: any;
  showUnavailable: boolean;
  roomData: Array<any>; // is it acceptable for this to be generic or should we pull in IRoomButtonProps
  settingsDialog?: React.RefObject<SettingsDialog>;
}

export default class RoomFinder extends React.Component<IRoomFinderProps, IRoomFinderState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoading: false,
      isBooking: false,
      hasError: false,
      startTime: null,
      endTime: null,
      showUnavailable: false,
      roomData: [],
      settingsDialog: React.createRef(),
    };
  }

  onInterval() {
    this.refreshRoomInfo(false);
  }

  componentDidMount() {
    setInterval(this.onInterval.bind(this), 2000);
    this.refreshRoomInfo(true);
  }

  makePromise = function (itemField) {
    return new Promise(function(resolve, reject) {
      itemField.getAsync(function (asyncResult) {
        if (asyncResult.status.toString === "failed") {
          reject(asyncResult.error.message);
        }
        else {
          resolve(asyncResult.value);
        }
      });
    });
  }

  loadRoomsFromExampleData = async () => {
    var that = this;
    that.setState({isLoading: true});

    // induce an artificial 2 second delay
    setTimeout(function() {
      that.setState({
        ...that.state,
        roomData: createListItems(5000),
        isLoading: false,
      });
    }, 2000)
  }

  retrieveRoomsFromServer = async (startTime, endTime) => {
    var that = this;
    that.setState({isLoading: true});
    var url = `${this.props.apiBasePath}/spaces/rooms/availability?start=${startTime}&end=${endTime}`;
    try {
      const response = await axios.get(url);
      that.setState({
        ...that.state,
        roomData: response.data,
        isLoading: false,
      });
    } catch (error) {
      console.error(error);
      that.setState({isLoading: false});
    }
  }

  refreshRoomInfo = async (force) => {
    var that = this;
    var item = Office.context.mailbox.item;
    Promise.all([that.makePromise(item.start), that.makePromise(item.end)])
      .then(function(values) {
        if (force || !moment(values[0]).isSame(that.state.startTime) || !moment(values[1]).isSame(that.state.endTime)) {
          that.setState({startTime: moment(values[0])});
          that.setState({endTime: moment(values[1])});
          var startTime = encodeURIComponent(moment(values[0]).format('YYYY-MM-DDTHH:mm:ss'));
          var endTime = encodeURIComponent(moment(values[1]).format('YYYY-MM-DDTHH:mm:ss'));
          if (that.props.useSampleData) {
            // avaiability is reandomized, so not utilizing startTime and endTime params
            that.loadRoomsFromExampleData();
          } else {
            that.retrieveRoomsFromServer(startTime, endTime);
          }
        }
        })
      .catch(function(error) {
        console.log(error);
      });
  }

  onToggleChange = ({}, checked: boolean) => {
    this.setState({showUnavailable: !checked});
  };

  dismissError = () => {
    this.setState({hasError: false});
  };

  addRoomToMeeting = (roomName) => {
    Office.context.mailbox.item.location.setAsync(roomName, function (asyncResult) {
      if (asyncResult.status == Office.AsyncResultStatus.Failed) {
          console.log("Error written location in outlook : " + asyncResult.error.message);
      } else {
          console.log("Location written in outlook");
      }
    });
  }

  bookRoomFromExampleData = async (roomInfo) => {
    var that = this;
    that.setState({isBooking: true});

    // induce an artificial 4 second delay
    setTimeout(function() {
      that.setState({
        ...that.state,
        isBooking: false,
        hasError: false,
      });
      that.addRoomToMeeting(roomInfo.roomBuildingAndNumber);
    }, 4000)
  }

  bookRoomOnServer = async (roomInfo, _startTime, _endTime) => {
    var that = this;
    this.setState({isBooking: true});
    var url = `${this.props.apiBasePath}/spaces/rooms/${roomInfo.roomId}/reservation`;

    const start = moment(this.state.startTime).format('YYYY-MM-DD HH:mm');
    const end = moment(this.state.endTime).format('YYYY-MM-DD HH:mm');
    let name = 'Event Booked via Outlook';
    let userName = 'Outlook User';
    let userEmail = 'noreply@aais.com';

    try {
      Office.context.mailbox.item.organizer.getAsync((asyncResult) => {
        if (asyncResult.value.displayName) { userName = asyncResult.value.displayName; }
        if (asyncResult.value.emailAddress) { userEmail = asyncResult.value.emailAddress; }
        
        Office.context.mailbox.item.subject.getAsync(async (asyncResult) => {
          if (asyncResult.value && asyncResult.value.length > 0) {
            name = `${asyncResult.value} (via Outlook)`;
          }

          const postBody = { name, userName, userEmail, start, end };

          console.log(`POST URL:   ${url}`);
          console.log(`POST BODY:   ${JSON.stringify(postBody, null, 2)}`);
    
          const postResponse = await axios.post(url, postBody);
          console.log(`POST REPONSE: ${JSON.stringify(postResponse, null, 2)}`);
    
          // set event url to postResponse.data.eventId
          const eventId = postResponse.data.eventId;
          const astraScheduleInstanceUrl = `https://www.aaiscloud.com/ARCHealthEducation`;
          const astraScheduleEventUrl = `${astraScheduleInstanceUrl}/events/EventForm.aspx?id=${eventId}`;
          // https://www.aaiscloud.com/ARCHealthEducation/events/EventForm.aspx?id=311ed6cc-5570-44cc-b476-d71af718e76d
    
          that.setState({
            ...that.state,
            isBooking: false,
            hasError: false,
          });
          that.addRoomToMeeting(roomInfo.roomBuildingAndNumber);
          this.props.onBookRoomSuccessful(
            roomInfo.roomBuildingAndNumber,
            moment(this.state.startTime).format('dddd, MMMM Do YYYY'),
            moment(this.state.startTime).format('LT'),
            moment(this.state.endTime).format('LT'),
            astraScheduleEventUrl,
          ); // Call injected onBookRoomSuccessful callback
        });  
      });
    } catch (error) {
      that.setState({isBooking: false});
      this.setState({hasError: true});
      console.log(error);

      that.addRoomToMeeting(roomInfo.roomBuildingAndNumber);
    }
  }

  onBookRoom = async () => {
    let roomInfo = Office.context.roamingSettings.get(SELECTED_ROOM_SETTING);
    if (roomInfo && roomInfo.roomBuildingAndNumber) {
      var startTime = encodeURIComponent(moment(this.state.startTime).format('YYYY-MM-DDTHH:mm:ss'));
      var endTime = encodeURIComponent(moment(this.state.endTime).format('YYYY-MM-DDTHH:mm:ss'));

      if (this.props.useSampleData) {
        this.bookRoomFromExampleData(roomInfo);
      } else {
        this.bookRoomOnServer(roomInfo, startTime, endTime);
      }
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <Stack grow>
          <Stack verticalAlign="center" styles={stackStyles}>
            <Spinner size={SpinnerSize.large} label="Loading Available Rooms" ariaLive="assertive" labelPosition="right" />
          </Stack>
        </Stack>
      )
    }
    else if (this.state.isBooking) {
      return (
        <Stack grow>
          <Stack verticalAlign="center" styles={stackStyles}>
            <Spinner size={SpinnerSize.large} label="Reserving Room in Ad Astra" ariaLive="assertive" labelPosition="right" />
          </Stack>
        </Stack>
      )
    }

    return (
      <div>
        <div style={{ paddingLeft: '16px', paddingRight: '16px', paddingBottom: '10px', borderBottomWidth: '1px',
                      borderColor: 'rgba(237, 235, 233, 1)', borderBottomStyle: 'solid'}}
                      onContextMenu={(e) => {
                        this.state.settingsDialog.current.showDialog();
                        e.preventDefault();
                      }}
        >
          <SettingsDialog ref={this.state.settingsDialog} />
          {/* <div className="ms-SearchBoxExample" style={{borderColor: 'rgba(237, 235, 233, 1)'}}>
            <SearchBox
              placeholder="Search by Ad Astra room name"
              onSearch={newValue => console.log('value is ' + newValue)}
              onFocus={() => console.log('onFocus called')}
              onBlur={() => console.log('onBlur called')}
              onChange={() => console.log('onChange called')}
            />
          </div> */}
          <div style={{ marginTop: '13px', marginBottom: '5px' }} >
              <Toggle
                defaultChecked={!this.state.showUnavailable}
                label="Only available rooms"
                inlineLabel={true}
                onFocus={() => console.log('onFocus called')}
                onBlur={() => console.log('onBlur called')}
                onChange={this.onToggleChange}
              />
          </div>
        </div>
        <RoomList items={this.state.roomData} showUnavailable={this.state.showUnavailable} />
        { !this.state.hasError &&
          <PrimaryButton className='book-room-button' buttonType={ButtonType.hero} onClick={this.onBookRoom} text="Book Room"/>
        }
        { this.state.hasError &&
          <MessageBar className='error-message-bar' messageBarType={MessageBarType.error}
          onDismiss={this.dismissError} isMultiline={false} dismissButtonAriaLabel="Close">
            This is where we'd book the room in Astra Schedule. We're still working on it!
        </MessageBar>
      }
      </div>
);
  }
}
