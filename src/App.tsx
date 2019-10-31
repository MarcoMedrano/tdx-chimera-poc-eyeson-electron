import React, { Component, Fragment } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { IconButton } from '@rmwc/icon-button';
import { ThemeProvider } from '@rmwc/theme';
import { Grid, GridCell } from '@rmwc/grid';
import { LinearProgress } from '@rmwc/linear-progress';
// import eyeson from 'eyeson';
import Toolbar from './Toolbar';
import Video from './Video';
import Timer from 'react-compound-timer';

import './App.css';

import RoomClient from './RoomClient';

const API_KEY_LENGTH = 42;
type AppState = {
  connecting: boolean,
  stream: string,
  audio: boolean,
  recording: boolean,
  recording_link: string,
  recording_duration: number | null,
  guest_link: string,
}
class App extends Component<{}, AppState> {

  private roomClient!: RoomClient;

  constructor(props:{}) {
    super(props)
    this.state = {
      connecting: false,
      stream: "",
      audio: false,
      recording: false,
      recording_link: "",
      recording_duration: null,
      guest_link: ""};
  }

  private startOpenningRoom = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.time("TDX-time Total to ScreenRecording");
    console.time("TDX-time Total to JoinRoom");

    const apiKey = event.target.value.trim();
    if (apiKey.length !== API_KEY_LENGTH) { return; }

    console.time("TDX-time OpenRoom");
    this.roomClient = new RoomClient(apiKey);

    this.setState({ connecting: true });

    const party = await this.roomClient.openRoom();
    console.timeEnd("TDX-time OpenRoom");

    console.log("TDX Room opened\n", JSON.stringify(party));

    console.time("TDX-time Connect");
    // eyeson.start(party.access_key);
    // eyeson.connect(party.access_key);
    console.timeEnd("TDX-time Connect");

    this.setState({ guest_link: party.links.guest_join });
  }

  private toggleRecording = () => {
    // eyeson.send({
    //   type: this.state.recording ? 'stop_recording' : 'start_recording',
    // });
    this.setState({ recording: !this.state.recording });
  }

  /**
   * render
   */
  public render() {

    return (
      <ThemeProvider options={{ primary: '#9e206c', secondary: '#6d6d6d' }}>
        <Toolbar title="TDX POC" />
        <Grid className="App">
          <GridCell span={12}>
            {this.state.connecting && <LinearProgress determinate={false} />}
          </GridCell>
          <GridCell span={11}>
            {!this.state.stream && (
              <Fragment>
                <TextField
                  label="API Access Key"
                  onChange={this.startOpenningRoom}
                  disabled={this.state.connecting}
                />
                <TextFieldHelperText>
                  Use your API access.
                </TextFieldHelperText>
              </Fragment>
            )}
            {this.state.stream && <Video src={this.state.stream} />}
          </GridCell>
          <GridCell span={1} className="App-sidebar">
            {this.state.stream && (
              <Fragment>
                <IconButton
                  checked={this.state.recording}
                  onClick={this.toggleRecording}
                  label="Toggle recording"
                  icon={this.state.recording ? 'radio_button_checked' : 'radio_button_unchecked'}
                />
              </Fragment>
            )}
          </GridCell>
          <GridCell span={12}>
            {this.state.recording && <Timer><strong><Timer.Seconds /></strong> seconds since we started to record screen.</Timer>}
          </GridCell>
          <GridCell span={12}>
            {this.state.guest_link && <><strong>Guest Link: </strong> <a rel="noopener noreferrer" target="_blank" href={this.state.guest_link} >{this.state.guest_link}</a></>}
          </GridCell>
          <GridCell span={12}>
            {this.state.recording_link && <><div>Recording duration: {this.state.recording_duration} seconds.</div> <a rel="noopener noreferrer" target="_blank" href={this.state.recording_link} >DOWNLOAD</a></>}
          </GridCell>
        </Grid>
      </ThemeProvider>
    );
  }
}

export default App;
