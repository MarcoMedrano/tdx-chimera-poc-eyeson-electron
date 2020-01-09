class EyesonRecordingService {

  masterKey = "totally-insecure";
  init = null;
  serviceUrl = "https://streamrec.dev-visocon.com";

  constructor() {   
    this.init = {
      method: 'POST',
      mode: 'cors',
      cache: 'default'
    };
  }

  obtainToken = async (clientId) => {
    if (clientId == null) { return }

    const init = {...this.init, body: JSON.stringify({ master_key: this.masterKey })};

    const request = new Request(`${this.serviceUrl}/auth/${clientId}`, init);
    const response = await fetch(request);
    
    return await response.json();
  }
  
  invalidateToken = async (clientId) => {
    if (clientId == null) { return }

    const init = {...this.init, method: 'DELETE'}

    const request = new Request(`${this.serviceUrl}/auth/${clientId}`, init);
    const response = await fetch(request);
    
    return await response.json();
  }
}

export default EyesonRecordingService;