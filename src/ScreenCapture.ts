import { desktopCapturer } from 'electron';

export default class ScreenCapture {

  public async getScreenStream(): Promise<MediaStream> {
    try {
      let sourceId = "";
      console.log("ScreenCapture " + "In  getScreenTrack()");
      const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
      
      for (const source of sources) {
        console.log("ScreenCapture " + 'Found screen source: ' + source.name);

        if (source.name === 'Entire screen' || source.name === "Screen 1") {
          sourceId = source.id;
          console.log("ScreenCapture " + `Found screen source: ${source.name} with id ${source.id}`);
        }
      }

      return await this.getDesktopMedia(sourceId);
    } catch (e) {
      console.log("ScreenCapture " + e);
      return new Promise<MediaStream>((r, f) => { f(e) });
    }
  }

  public getScreenTrack = async (): Promise<MediaStreamTrack> => {
    const stream = await this.getScreenStream();
    return stream.getVideoTracks()[0];
  }

  private getDesktopMedia = async (sourceId: string): Promise<MediaStream> => {
    try {

      let stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // @ts-ignore
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
      return new Promise<MediaStream>((r, f) => { f(e) });
    }
  }
}
