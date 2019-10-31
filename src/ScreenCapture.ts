import * as React from 'react';
import { desktopCapturer } from 'electron';

export default class ScreenCapture {

  public async getScreenTrack() : Promise<MediaStreamTrack> {
    try {
      console.log("In  getScreenTrack()");
      const screenTrack = await desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        for (const source of sources) {
          console.log('Found screen source: ' + source.name);

          if (source.name === 'Entire screen' || source.name === "Screen 1") {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                  // @ts-ignore
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: source.id,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                  }
                }
              })
              const screenTrack = stream.getVideoTracks()[0];
              console.log('Got screen track');
              return screenTrack;

            } catch (e) {
              console.error("Error on getScreenTrack ", e)
            }
          }
        }
      })

      return new Promise<MediaStreamTrack>((r, f)=>{ r(screenTrack)});
    } catch (e) {
      console.log(e);
      return new Promise<MediaStreamTrack>((r, f)=>{ f(e)});
    }
  }
}
