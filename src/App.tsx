import React, { Component, Fragment } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { IconButton } from '@rmwc/icon-button';
import { ThemeProvider } from '@rmwc/theme';
import { Grid, GridCell } from '@rmwc/grid';
import { LinearProgress } from '@rmwc/linear-progress';
import Toolbar from './Toolbar';
import Video from './Video';

import './App.css';

import EyesonRecordingService from './EyesonRecordingService';
import ScreenCapture from './ScreenCapture';
import { StopWatch, IStopWatchManager } from './StopWatch';

import eyeson from 'eyeson';

const CLIENT_ID_LENGTH = 7;

type AppState = {
  clientId: string | null,
  connecting: boolean,
  sourceIds: [string] | [],
  stream: MediaStream | null,
  recording: boolean,
  recording_bucket: string | null,
  recording_link: string | null
}
class App extends Component<{}, AppState> {

  private recordingService!: EyesonRecordingService;
  private screenCap: ScreenCapture;

  private stopWatchConnectionStarted!: IStopWatchManager;
  private stopWatchRoomJoined!: IStopWatchManager;

  private sourceIndex = 0;

  constructor(props: {}) {
    super(props)
    this.state = {
      clientId: null,
      connecting: false,
      sourceIds: [],
      stream: null,
      recording: false,
      recording_bucket: null,
      recording_link: null
    };
    this.screenCap = new ScreenCapture();
  }

  public componentDidMount = () => {
    this.setState({
      recording_bucket: "",
      recording_link: ""
    });
  }

  private startOpenningRoom = async (event: React.ChangeEvent<HTMLInputElement>) => {
    this.stopWatchConnectionStarted.start();

    const clientId = event.target.value.trim();
    if (clientId.length !== CLIENT_ID_LENGTH) { return; }

    this.setState({
      clientId: clientId,
      connecting: true
    });

    /* AUTH_TOKEN EXCHANGE
      This should be implmeneted server-side due to security issues (master key visible in client).
      You propably don't want to generate the presigned AWS URLs for recordings in the client as well.
      Also for webhooks a webservice will be mandatory.
    */
    this.recordingService = new EyesonRecordingService();
    const party = await this.recordingService.obtainToken(clientId);
    if (typeof(party) === 'undefined' || party.auth_token == null) { return }
    console.log("TDX Room opened\n", JSON.stringify(party));
    /* END OF AUTH_TOKEN EXCHANGE */

    // initialize eyeson client once an auth_token has been obtained for the spcific client
    eyeson.connect(party.auth_token);

    this.setState({ connecting: false });

    await this.screenCap.getScreenSources()
                              .then(sourceIds => {
                                this.setState({ sourceIds: sourceIds });
                              });

    // pick a random screen to be recorded
    await this.pickRandomStream(() => this.toggleRecording());
  }

  private toggleRecording = () => {
    if (this.state.recording) {
      eyeson.stopRecording();
    } else {
      // this generates a new recording session every time. if you want to just switch the screen within the same recording, use eyeson.switchStream
      eyeson.startRecording(this.state.stream, this.state.clientId, this.state.recording_bucket, "")
      .then((recordingId: any) => {
        console.debug('recording started', recordingId);
      })
      .catch((err: any) => {
        console.debug('recording error', err);
      });
    }

    this.setState({ recording: !this.state.recording });
  }

  private toggleScreen = async () => {
    await this.pickRandomStream(() => eyeson.switchStream(this.state.stream));
  }

  private pickRandomStream = async (callback: () => void) => {
    if (this.state.sourceIds.length <= 0) { return }
    this.sourceIndex = this.sourceIndex < this.state.sourceIds.length ? this.sourceIndex + 1 : 0;
    const sourceId = this.state.sourceIds[this.sourceIndex];
    this.screenCap.getScreenStream(sourceId)
                  .then(stream => {
                    this.setState({ stream: stream }, callback);
                  });
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
                  label="Client ID"
                  onChange={this.startOpenningRoom}
                  disabled={this.state.connecting}
                />
                <TextFieldHelperText>
                  Use your unique client ID.
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
            {this.state.sourceIds.length > 0 && this.state.recording && (
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
            {this.state.stream && !this.state.recording && this.state.recording_link && <><a rel="noopener noreferrer" target="_blank" href={this.state.recording_link} >DOWNLOAD</a></>}
          </GridCell>
        </Grid>
      </ThemeProvider>
    );
  }
}

export default App;
