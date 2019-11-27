import { desktopCapturer } from 'electron';

export default class ScreenCapture {

  public getScreenStream = async (sourceId: string): Promise<MediaStream> => {
    console.log("Using ScreenCapture screen source: " + sourceId);
    try {
      return await this.getDesktopMedia(sourceId);
    } catch (e) {
      console.log("ScreenCapture " + e);
      throw e;
    }
  }

  public getScreenSources = async (): Promise<[string]> => {
    try {
      const sourceIds:[string] = [""];
      console.log("ScreenCapture In  getScreenTrack()");
      const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
      for (const source of sources) {
        console.log(`ScreenCapture Found screen source: ${source.name} with id ${source.id}`);
        sourceIds.push(source.id);
      }
      return sourceIds;
    } catch (e) {
      console.log("ScreenCapture " + e);
      throw e;
    }
  }

  // public getScreenTrack = async (): Promise<MediaStreamTrack> => {
  //   const stream = await this.getScreenStream();
  //   const tracks = stream.getVideoTracks()
  //   if(tracks.length > 0)
  //     return tracks[0];
  //   else
  //     throw new Error("No tracks found");
  // }

  private getDesktopMedia = async (sourceId: string): Promise<MediaStream> => {
    try {

      let stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // @ts-ignore the mandatory field is actually used but somehow eletron types does not recognize it
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      })
      console.log("ScreenCapture found ", JSON.stringify(stream));

      return stream;
    } catch (e) {
      console.error("Error on getScreenTrack ", e);
      throw e;
    }
  }
}
