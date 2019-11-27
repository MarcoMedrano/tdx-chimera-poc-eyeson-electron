import React, { Component, Fragment } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { IconButton } from '@rmwc/icon-button';
import { ThemeProvider } from '@rmwc/theme';
import { Grid, GridCell } from '@rmwc/grid';
import { LinearProgress } from '@rmwc/linear-progress';
import eyeson from 'eyeson';
import Toolbar from './Toolbar';
import Video from './Video';

import './App.css';

import RoomClient from './RoomClient';
import ScreenCapture from './ScreenCapture';
import { StopWatch, IStopWatchManager } from './StopWatch';

const API_KEY_LENGTH = 42;
type AppState = {
  connecting: boolean,
  sourceIds: [string] | [],
  stream: MediaStream | null,
  recordingStarted: boolean,
  recording: boolean,
  recording_link: string | null,
  recording_duration: number | null,
  guest_link: string | null,
}
class App extends Component<{}, AppState> {

  private roomClient!: RoomClient;
  private screenCap: ScreenCapture;

  private stopWatchConnectionStarted!: IStopWatchManager;
  private stopWatchRoomJoined!: IStopWatchManager;

  constructor(props: {}) {
    super(props)
    this.state = {
      connecting: false,
      sourceIds: [],
      stream: null,
      recordingStarted: false,
      recording: false,
      recording_link: null,
      recording_duration: null,
      guest_link: null
    };
    this.screenCap = new ScreenCapture();
  }

  public componentDidMount = () => {
    eyeson.onEvent(this.handleEvent);
  }

  private handleEvent = async (event: any) => {
    if (event.type !== "voice_activity")
      console.debug("TDX Eyeson event received ", JSON.stringify(event));

    switch (event.type) {
      case "connection":
        if (event.connectionStatus === "ready") {
          // grab all available windows and screens and store it in state
          await this.screenCap.getScreenSources()
                              .then(sourceIds => {
                                this.setState({ sourceIds: sourceIds });
                              });

          eyeson.join({ audio: false, video: true });
        }
        break;
      case "accept":
        if (this.state.connecting) {
          console.log("TDX Eyeson  Room joined");
          this.stopWatchRoomJoined.start();
        }
        break;
      case "recording_update":
        if (event.recording.created_at) {
          this.stopWatchConnectionStarted.stop();
          this.stopWatchRoomJoined.stop();
          console.log("TD TIME", this.stopWatchRoomJoined.getTime());
        }

        this.setState({
          recording_link: event.recording.links.download,
          recording_duration: event.recording.duration
        });
        break;
      case "podium":
        if (this.state.connecting) {
          this.setState({
            connecting: false
          });
          // pick a random screen to be shown after connect
          this.toggleScreen();
          this.toggleRecording();
        }

        break;
      default:
    }
  }

  private startOpenningRoom = async (event: React.ChangeEvent<HTMLInputElement>) => {
    this.stopWatchConnectionStarted.start();
    const apiKey = event.target.value.trim();
    if (apiKey.length !== API_KEY_LENGTH) { return; }

    this.roomClient = new RoomClient(apiKey);

    this.setState({ connecting: true });

    const party = await this.roomClient.openRoom();

    console.log("TDX Room opened\n", JSON.stringify(party));

    // eyeson.start(party.access_key);
    eyeson.connect(party.access_key);

    this.setState({ guest_link: party.links.guest_join });
  }

  private toggleRecording = () => {
    eyeson.send({
      type: this.state.recording ? 'stop_recording' : 'start_recording',
    });
    this.setState({ recording: !this.state.recording });
  }

  private updateStream(stream: MediaStream) {
    eyeson.send({
      type: 'start_screen_capture',
      audio: false,
      screen: true,
      screenStream: stream
    });
    this.setState({ stream: stream });
  }

  private toggleScreen = async () => {
    if (this.state.sourceIds.length <= 0) { return }
    const sourceId = this.state.sourceIds[Math.floor(Math.random() * this.state.sourceIds.length)];
    this.screenCap.getScreenStream(sourceId)
                  .then(this.updateStream.bind(this));
  }

  /**
   * render
   */
  public render() {

    return (
      <ThemeProvider options={{ primary: '#9e206c', secondary: '#6d6d6d' }}>
        <Toolbar title="TDX POC" />
        <StopWatch text="since connecting has started." managerRef={(ref) => (this.stopWatchConnectionStarted = ref)} />
        <StopWatch text="since room joined." managerRef={(ref) => (this.stopWatchRoomJoined = ref)} />
        All timers stops when recording event comes from eyeson.
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
              <Fragment >
                <IconButton
                  checked={this.state.recording}
                  onClick={this.toggleRecording}
                  label="Toggle recording"
                  icon={this.state.recording ? 'stop' : 'radio_button_checked'}
                />
                {this.state.recording && <>Recording</>}
              </Fragment>
            )}
            {this.state.sourceIds.length > 0 && (
              <Fragment >
                <IconButton
                  onClick={this.toggleScreen}
                  label="Toggle screen"
                  icon="refresh"
                />
                Toggle screen
              </Fragment>
            )}
          </GridCell>
          <GridCell span={12}>
            {this.state.recording && <StopWatch text="since we started to record screen." startImmediately={true} />}
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
