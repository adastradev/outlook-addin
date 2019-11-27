import * as React from 'react';
import { CompoundButton, IButtonProps } from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react';

// note: this should match to server definition
export interface ISourceRoomInfo {
  roomId: string;
  roomBuildingAndNumber: string;
  whyIsRoomIdHereTwice: string;
  available: boolean;
  capacity?: number;
}

export interface IRoomButtonProps extends IButtonProps {
  roomInfo: ISourceRoomInfo;
  onClickFn: Function;
}

export interface IRoomButtonState {
  selected: boolean;
}

export class DetailedRoomButton extends React.Component<IRoomButtonProps, IRoomButtonState> {
  constructor(props: IRoomButtonProps) {
    super(props);

    this.state = {
      selected: false,
    }
  }

  public render() {
    return (
      <CompoundButton
        {...this.props}
        checked={this.state.selected}
        allowDisabledFocus
        onClick={() => this.props.onClickFn(this) }
        text={this.props.roomInfo.roomBuildingAndNumber}
        onRenderDescription={this._onRenderDescription}
        iconProps={{
          iconName: 'Room',
          style: {
            color: 'white',
            backgroundColor: '#0078d7',
            borderRadius: '50%',
            fontSize: 'medium',
            padding: '5px'
          }
        }}
        style={{
          paddingBottom: '9px',
          paddingTop: '9px',
          height: 'auto',
          width: '100%',
          borderStyle: 'none',
          maxWidth: '500px',
        }}
      >
      </CompoundButton>
    );
  }

  _onRenderDescription(props: IRoomButtonProps): JSX.Element {
    let clockIcon = 'Clock';
    let text = 'Available';
    let style = 'available-text';

    if (props.roomInfo.available === false) {
      clockIcon = 'CircleStopSolid';
      text = 'Unavailable';
      style = 'unavailable-text';
    }

    return (
      <div>
        <span className={style}>
          <Icon iconName={clockIcon} styles={{ root: { marginRight: 5 } }} />
          {text}
        </span>
        { props.roomInfo.capacity &&
          <span>
            <Icon iconName="Contact" styles={{ root: { marginRight: 5 } }} />
            <span>{props.roomInfo.capacity}</span>
          </span>
        }
      </div>
    );
  }
}
