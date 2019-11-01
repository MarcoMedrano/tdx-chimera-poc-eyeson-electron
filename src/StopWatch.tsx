import React, { Component } from 'react';
import { GridCell } from '@rmwc/grid';
import Timer from 'react-compound-timer/build';


export interface IStopWatchManager {
  getTime: Function,
  getTimerState: Function,
  pause: Function,
  reset: Function,
  resume: Function,
  setCheckpoints: Function,
  setDirection: Function,
  setTime: Function,
  start: Function,
  stop: Function,
  timerState: string

}

interface IStopWatchProps {
  text?: string,
  startImmediately?: boolean,
  managerRef?: (ref: IStopWatchManager) => {}
}

class StopWatch extends Component<IStopWatchProps, {}> {

  public componentDidMount = () => {
  }

  public render = () => {
    return (
      <GridCell span={12}>
        <Timer
          formatValue={(value) => `${(value < 10 ? `0${value}` : value)}`}
          startImmediately={this.props.startImmediately || false}
        >
          {
            (handler: IStopWatchManager) => {
              console.log("Handler ", handler.getTime());
              if (this.props.managerRef)
                this.props.managerRef(handler);

              return (
                <>
                  {
                    handler.getTime() > 60000 && 
                    <><strong><Timer.Minutes /></strong> minutes &nbsp;</>
                  }
                  <strong><Timer.Seconds /></strong> seconds {this.props.text}
                </>
              );
            }
          }
        </Timer>
      </GridCell>
    );
  }
}

export { StopWatch };