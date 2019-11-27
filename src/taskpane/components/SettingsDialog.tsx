import * as React from 'react';
import { Dialog, DialogType, DialogFooter, ContextualMenu, Link, Slider } from 'office-ui-fabric-react';
import { WELCOME_SCREEN_SETTTING, SELECTED_ROOM_SETTING } from '../../utilities/config';

export interface ISettingsDialogStates {
  hideDialog: boolean;
  showWelcomeScreen: number;
}

export default class SettingsDialog extends React.Component<{}, ISettingsDialogStates> {
  public state: ISettingsDialogStates = {
    hideDialog: true,
    showWelcomeScreen: Office.context.roamingSettings.get(WELCOME_SCREEN_SETTTING),
  };

  private _dragOptions = {
    moveMenuItemText: 'Move',
    closeMenuItemText: 'Close',
    menu: ContextualMenu
  };

  // this is a very non-react'y way to do this, but since this settings dialog is likely
  // temporary, we'll roll with it
  public showDialog() {
    this.setState({
      ...this.state,
      showWelcomeScreen: Office.context.roamingSettings.get(WELCOME_SCREEN_SETTTING),
    })
    this._showDialog();
  };

  private _restoreDefaults() {
    Office.context.roamingSettings.remove(WELCOME_SCREEN_SETTTING);
    Office.context.roamingSettings.remove(SELECTED_ROOM_SETTING);
    Office.context.roamingSettings.saveAsync(() => {
      Office.context.ui.closeContainer();
    });

  };

  private _applySetting(setting, value) {
    Office.context.roamingSettings.set(setting, value);
    Office.context.roamingSettings.saveAsync();
  };

  private _onSetShowWelcomeScreen = (value: number) => {
    this.setState({ showWelcomeScreen: value });
    this._applySetting(WELCOME_SCREEN_SETTTING, value);
  };

  private _getShowWelcomeHintText(value) {
    let msg = '';
    switch (value) {
      case 3:
        msg = 'Always';
        break;
      case 2:
        msg = 'Next time';
        break;
      default:
        msg = 'Never';
        break;
    }
    return msg;
  }

  public render() {
    const { hideDialog } = this.state;
    return (
      <Dialog
        hidden={hideDialog}
        onDismiss={this._closeDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Ad Astra Settings',
          subText: 'Here you can change settings for the Ad Astra add-in'
        }}
        modalProps={{
          isBlocking: false,
          isModeless: true,
          dragOptions: this._dragOptions
        }}
      >
        <Slider label="Show welcome screen:"
          min={1} max={3} step={1}
          valueFormat={(value: number) => this._getShowWelcomeHintText(value)}
          value={this.state.showWelcomeScreen}
          onChange={(value: number) => this._onSetShowWelcomeScreen(value)}
          showValue={true}
        />
        <Link onClick={this._restoreDefaults}>Reset All Settings</Link>
        <DialogFooter>
          {/* <PrimaryButton onClick={this._saveAndClose} text="Save" /> */}
          {/* <DefaultButton onClick={this._closeDialog} text="Close" /> */}
        </DialogFooter>
      </Dialog>
    );
  }

  private _showDialog = (): void => {
    this.setState({ hideDialog: false });
  };

  private _closeDialog = (): void => {
    this.setState({ hideDialog: true });
  };
}
