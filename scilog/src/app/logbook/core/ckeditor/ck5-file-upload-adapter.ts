import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CK5FileUpload {

  loader: any;  // your adapter communicates to CKEditor through this
  url: string;
  imageToShow: string | ArrayBuffer;


  // serverSettings = new ServerSettingsService;

  constructor(loader, private http: HttpClient) {
    this.loader = loader;
    // this.url = this.serverSettings.getServerAddress()+"files/";
    console.log('Upload Adapter Constructor', this.loader, this.url);
  }

  upload() {
    return this.loader.file
      .then((data: File) => new Promise((resolve, reject) => {
        console.log(data);
        this.createImageFromBlob(data).then(result => {
          console.log(result);
          let resolveVal = {
            default: result
          };
          console.log(JSON.stringify(resolveVal));
          resolve(resolveVal)
        })
      }
      ));
  }

  // uploadFile(file: File, url?: string) {
  //   console.log(file);
  //   const idToken = localStorage.getItem("id_token");


  //   const headersFile = new HttpHeaders().append('accept', 'application/json');
  //   headersFile.append("Content-Type", "multipart/form-data");
  //   headersFile.append("Authorization", "Bearer " + idToken);

  //   let formData = new FormData();
  //   formData.append('file', file);
  //   console.log(formData.getAll('file'));
  //   console.log(this.serverSettings.getServerAddress() + "files")
  //   console.log('formData', formData);
  //   return this.http.post(this.serverSettings.getServerAddress() + "files", formData, { headers: headersFile });
  // }

  abort() {
    console.log('UploadAdapter abort');
  }

  createImageFromBlob(image: Blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result)
        console.log(reader)
      };
      reader.readAsDataURL(image);
    })

  }

}




// export class CK5ImageUploadAdapterPlugin {
//   constructor(editor, private httpClient: HttpClient) {
//     console.log('CK5ImageUploadAdapterPlugin called');
//     editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
//       return new CK5ImageUploadAdapter(loader, this.httpClient);
//     };
//   }
// }


