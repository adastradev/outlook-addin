import * as React from 'react';
import { FocusZone, FocusZoneDirection, List, ITheme, mergeStyleSets, getTheme, getFocusStyle } from 'office-ui-fabric-react';
import { DetailedRoomButton, ISourceRoomInfo } from './DetailedRoomButton';
import { SELECTED_ROOM_SETTING } from '../../utilities/config';

export interface IRoomListProps {
  items: ISourceRoomInfo[];
  showUnavailable: boolean;
}

export interface IRoomListState {
  selectedItem: DetailedRoomButton;
}

const evenItemHeight = 25;
const oddItemHeight = 50;
const numberOfItemsOnPage = 10;

const theme: ITheme = getTheme();
const { palette } = theme;

interface IListBasicExampleClassObject {
  itemCell: string;
}

const classNames: IListBasicExampleClassObject = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      selectors: {
        '&:hover': { background: palette.neutralLight }
      }
    }
  ],
  emptyList: [

  ]
});

export default class RoomList extends React.Component<IRoomListProps, IRoomListState> {
  constructor(props: IRoomListProps) {
    super(props);

    this.state = {
      selectedItem: null, // no initial selected item
    };
  }

  public render() {
    let items = this.props.items;
    const { showUnavailable } = this.props;

    if (!showUnavailable) {
      items = items.filter(item => item.available === true);
    }

    if (items.length > 0) {
      return (
        <FocusZone direction={FocusZoneDirection.vertical}>
          <div className='scroll-container' data-is-scrollable={true}>
            <List items={items} getPageHeight={this._getPageHeight} onRenderCell={this._onRenderCell} />
          </div>
        </FocusZone>
      );
    } else {
      return (
        <div className='empty-rooms-list'
             style={{ marginTop: '13px', marginBottom: '5px', marginLeft: '10px'}}
        >
          <h3>We couldn't find any rooms</h3>
        </div>
      );
    }
  }

  private _getPageHeight(idx: number): number {
    let h = 0;
    for (let i = idx; i < idx + numberOfItemsOnPage; ++i) {
      const isEvenRow = i % 2 === 0;

      h += isEvenRow ? evenItemHeight : oddItemHeight;
    }
    return h;
  }

  private _onRenderCell = (item: ISourceRoomInfo): JSX.Element => {
    return (
      <div data-is-focusable={true} className={classNames.itemCell}>
        <DetailedRoomButton roomInfo={item} onClickFn={this.onClickItem}/>
      </div>
    );
  };

  private onClickItem = (clickedItem: DetailedRoomButton) => {
    if (this.state.selectedItem === null) { // no currently selected item
      this.setState({ selectedItem: clickedItem });
      clickedItem.setState({ selected: !clickedItem.state.selected });
      this._selectRoom(clickedItem.props.roomInfo);
    } else if (clickedItem === this.state.selectedItem) { // unselect selected item
      this.setState({ selectedItem: null });
      clickedItem.setState({ selected: !clickedItem.state.selected });
      this._unselectRoom();
    } else { // select different item
      this.state.selectedItem.setState({ selected: false });
      this.setState({ selectedItem: clickedItem });
      clickedItem.setState({ selected: !clickedItem.state.selected });
      this._selectRoom(clickedItem.props.roomInfo);
    }
  }

  _selectRoom(roomInfo): void {
    Office.context.roamingSettings.set(SELECTED_ROOM_SETTING, roomInfo);
    console.log(`selected room. SELECTED_ROOM_SETTING = ${JSON.stringify(Office.context.roamingSettings.get(SELECTED_ROOM_SETTING), null, 2)}`);
  };

  _unselectRoom(): void {
    Office.context.roamingSettings.remove(SELECTED_ROOM_SETTING);
    console.log(`unselected room. SELECTED_ROOM_SETTING = ${JSON.stringify(Office.context.roamingSettings.get(SELECTED_ROOM_SETTING), null, 2)}`);
  };
}
