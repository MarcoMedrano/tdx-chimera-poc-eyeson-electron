import React, { Component } from 'react';
import './Video.css';

interface IVideoProps {
  src: MediaStream | MediaSource | Blob | null;
}

class Video extends Component<IVideoProps> {

  private videoElement!:HTMLVideoElement | null;

  public UNSAFE_componentWillReceiveProps = (nextProps: IVideoProps) => {
    if (this.props.src === nextProps.src) return;

    this.videoElement!.srcObject = nextProps.src;
    this.videoElement!.play();
  }

  shouldComponentUpdate() {
    return false; // disable updates
  }

  set video(ref: HTMLVideoElement | null) {
    this.videoElement = ref;
    ref!.srcObject = this.props.src;
    ref!.play();
  }

  render() {
    return <video className="Video" ref={ref => (this.video = ref)} />;
  }
}

export default Video;