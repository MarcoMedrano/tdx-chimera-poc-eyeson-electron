import React, {Component} from 'react';
import './Video.css';

interface IVideoProps {
  src: MediaStream | MediaSource | Blob | null;
}

class Video extends Component<IVideoProps> {

  shouldComponentUpdate() {
    return false; // disable updates
  }

  set video(ref: HTMLVideoElement | null) {
    ref!.srcObject = this.props.src;
    ref!.play();
  }

  render() {
    return <video className="Video" ref={ref => (this.video = ref)} />;
  }
}

export default Video;